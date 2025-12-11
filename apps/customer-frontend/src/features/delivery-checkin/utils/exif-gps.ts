// apps/customer-frontend/src/features/delivery-checkin/utils/exif-gps.ts
/**
 * EXIF GPS Extraction Utility
 * Extracts GPS coordinates from photo EXIF metadata
 * Requirements: 8.3 - EXIF GPS extraction from photos
 */

import type { EXIFGPSData } from "../types";

/**
 * Convert EXIF GPS coordinate to decimal degrees
 * EXIF stores GPS as [degrees, minutes, seconds]
 */
function convertDMSToDecimal(dms: number[], ref: string): number | null {
  if (!dms || dms.length < 3) return null;

  const [degrees, minutes, seconds] = dms;
  let decimal = degrees + minutes / 60 + seconds / 3600;

  // South and West are negative
  if (ref === "S" || ref === "W") {
    decimal = -decimal;
  }

  return decimal;
}

/**
 * Parse EXIF date string to timestamp
 * EXIF format: "YYYY:MM:DD HH:MM:SS"
 */
function parseEXIFDate(dateStr: string): number | null {
  if (!dateStr) return null;

  try {
    // Convert EXIF format to ISO format
    const isoStr = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const date = new Date(isoStr);
    return isNaN(date.getTime()) ? null : date.getTime();
  } catch {
    return null;
  }
}

/**
 * Read EXIF data from an ArrayBuffer
 * This is a lightweight EXIF parser focused on GPS data
 */
function readEXIFFromBuffer(buffer: ArrayBuffer): Record<string, any> | null {
  const view = new DataView(buffer);
  const exif: Record<string, any> = {};

  // Check for JPEG SOI marker
  if (view.getUint16(0) !== 0xffd8) {
    return null; // Not a JPEG
  }

  let offset = 2;
  const length = buffer.byteLength;

  while (offset < length) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }

    const marker = view.getUint8(offset + 1);

    // APP1 marker (EXIF)
    if (marker === 0xe1) {
      const segmentLength = view.getUint16(offset + 2);
      const exifOffset = offset + 4;

      // Check for "Exif\0\0" header
      const exifHeader = String.fromCharCode(
        view.getUint8(exifOffset),
        view.getUint8(exifOffset + 1),
        view.getUint8(exifOffset + 2),
        view.getUint8(exifOffset + 3)
      );

      if (exifHeader === "Exif") {
        const tiffOffset = exifOffset + 6;
        const littleEndian = view.getUint16(tiffOffset) === 0x4949;

        // Parse IFD0
        const ifd0Offset = view.getUint32(tiffOffset + 4, littleEndian);
        parseIFD(view, tiffOffset, tiffOffset + ifd0Offset, littleEndian, exif);
      }

      break;
    }

    // Skip to next marker
    if (marker >= 0xc0 && marker <= 0xfe) {
      const segmentLength = view.getUint16(offset + 2);
      offset += 2 + segmentLength;
    } else {
      offset += 2;
    }
  }

  return Object.keys(exif).length > 0 ? exif : null;
}

/**
 * Parse an IFD (Image File Directory) for GPS data
 */
function parseIFD(
  view: DataView,
  tiffOffset: number,
  ifdOffset: number,
  littleEndian: boolean,
  exif: Record<string, any>
): void {
  try {
    const entryCount = view.getUint16(ifdOffset, littleEndian);

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, littleEndian);

      // GPS IFD Pointer (tag 0x8825)
      if (tag === 0x8825) {
        const gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
        parseGPSIFD(
          view,
          tiffOffset,
          tiffOffset + gpsOffset,
          littleEndian,
          exif
        );
      }
    }
  } catch {
    // Ignore parsing errors
  }
}

/**
 * Parse GPS IFD for coordinates
 */
function parseGPSIFD(
  view: DataView,
  tiffOffset: number,
  gpsOffset: number,
  littleEndian: boolean,
  exif: Record<string, any>
): void {
  try {
    const entryCount = view.getUint16(gpsOffset, littleEndian);

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = gpsOffset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);

      switch (tag) {
        case 1: // GPSLatitudeRef
          exif.GPSLatitudeRef = String.fromCharCode(
            view.getUint8(entryOffset + 8)
          );
          break;
        case 2: // GPSLatitude
          exif.GPSLatitude = readRationals(
            view,
            tiffOffset,
            entryOffset,
            count,
            littleEndian
          );
          break;
        case 3: // GPSLongitudeRef
          exif.GPSLongitudeRef = String.fromCharCode(
            view.getUint8(entryOffset + 8)
          );
          break;
        case 4: // GPSLongitude
          exif.GPSLongitude = readRationals(
            view,
            tiffOffset,
            entryOffset,
            count,
            littleEndian
          );
          break;
        case 5: // GPSAltitudeRef
          exif.GPSAltitudeRef = view.getUint8(entryOffset + 8);
          break;
        case 6: // GPSAltitude
          exif.GPSAltitude = readRationals(
            view,
            tiffOffset,
            entryOffset,
            1,
            littleEndian
          )?.[0];
          break;
        case 29: // GPSDateStamp
          exif.GPSDateStamp = readString(
            view,
            tiffOffset,
            entryOffset,
            count,
            littleEndian
          );
          break;
      }
    }
  } catch {
    // Ignore parsing errors
  }
}

/**
 * Read rational values from EXIF
 */
function readRationals(
  view: DataView,
  tiffOffset: number,
  entryOffset: number,
  count: number,
  littleEndian: boolean
): number[] | null {
  try {
    const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
    const values: number[] = [];

    for (let i = 0; i < count; i++) {
      const offset = tiffOffset + valueOffset + i * 8;
      const numerator = view.getUint32(offset, littleEndian);
      const denominator = view.getUint32(offset + 4, littleEndian);
      values.push(denominator !== 0 ? numerator / denominator : 0);
    }

    return values;
  } catch {
    return null;
  }
}

/**
 * Read string from EXIF
 */
function readString(
  view: DataView,
  tiffOffset: number,
  entryOffset: number,
  count: number,
  littleEndian: boolean
): string {
  try {
    const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
    let str = "";

    for (let i = 0; i < count - 1; i++) {
      const char = view.getUint8(tiffOffset + valueOffset + i);
      if (char === 0) break;
      str += String.fromCharCode(char);
    }

    return str;
  } catch {
    return "";
  }
}

/**
 * Extract GPS data from a photo file
 * @param file - The photo file to extract GPS from
 * @returns Promise<EXIFGPSData> - Extracted GPS data or null values
 */
export async function extractGPSFromPhoto(file: File): Promise<EXIFGPSData> {
  const result: EXIFGPSData = {
    latitude: null,
    longitude: null,
    altitude: null,
    timestamp: null,
  };

  // Only process JPEG files (EXIF is typically in JPEG)
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return result;
  }

  try {
    const buffer = await file.arrayBuffer();
    const exif = readEXIFFromBuffer(buffer);

    if (!exif) {
      return result;
    }

    // Extract latitude
    if (exif.GPSLatitude && exif.GPSLatitudeRef) {
      result.latitude = convertDMSToDecimal(
        exif.GPSLatitude,
        exif.GPSLatitudeRef
      );
    }

    // Extract longitude
    if (exif.GPSLongitude && exif.GPSLongitudeRef) {
      result.longitude = convertDMSToDecimal(
        exif.GPSLongitude,
        exif.GPSLongitudeRef
      );
    }

    // Extract altitude
    if (exif.GPSAltitude !== undefined) {
      result.altitude = exif.GPSAltitude;
      if (exif.GPSAltitudeRef === 1 && result.altitude !== null) {
        result.altitude = -result.altitude; // Below sea level
      }
    }

    // Extract timestamp
    if (exif.GPSDateStamp) {
      result.timestamp = parseEXIFDate(exif.GPSDateStamp);
    }
  } catch (error) {
    console.warn("Failed to extract EXIF GPS data:", error);
  }

  return result;
}

/**
 * Check if a file has GPS data in EXIF
 */
export async function hasEXIFGPS(file: File): Promise<boolean> {
  const gps = await extractGPSFromPhoto(file);
  return gps.latitude !== null && gps.longitude !== null;
}
