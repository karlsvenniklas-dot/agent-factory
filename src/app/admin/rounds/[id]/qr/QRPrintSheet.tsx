"use client";

// QR-utskrift - en A4-sida per station.
// Använder qrcode.react för rendering.

import { QRCodeSVG } from "qrcode.react";

interface Station {
  id: string;
  name: string;
  position: number;
  qr_token: string;
}

interface Props {
  roundName: string;
  stations: Station[];
  baseUrl: string;
}

export function QRPrintSheet({ roundName, stations, baseUrl }: Props) {
  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .station-page {
            page-break-after: always;
            break-after: page;
          }
          .station-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
        }
      `}</style>

      {stations.map((station) => {
        const qrUrl = `${baseUrl}/station/${station.qr_token}`;

        return (
          <div
            key={station.id}
            className="station-page bg-white min-h-screen flex flex-col items-center justify-center p-12 text-center"
            style={{ minHeight: "297mm" }}
          >
            {/* Logo + titel */}
            <div className="mb-8">
              <div className="text-3xl mb-2" aria-hidden="true">🌲</div>
              <h1 className="text-3xl font-display font-bold text-forest-700">
                Tipspromenaden
              </h1>
              <p className="text-lg text-bark mt-1">i Kinnared</p>
            </div>

            {/* Omgång-namn */}
            <p className="text-base text-bark mb-6">{roundName}</p>

            {/* Station-info */}
            <div className="mb-8">
              <p className="text-lg font-semibold text-bark mb-1">
                Station {station.position}
              </p>
              <h2 className="text-4xl font-display font-bold text-soil">
                {station.name}
              </h2>
            </div>

            {/* QR-kod */}
            <div className="border-4 border-forest-600 rounded-2xl p-6 mb-8 bg-white">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                level="M"
                marginSize={1}
                style={{ display: "block" }}
              />
            </div>

            {/* Instruktion */}
            <div className="max-w-xs">
              <p className="text-xl font-semibold text-soil mb-2">
                Skanna med kameran
              </p>
              <p className="text-base text-bark leading-relaxed">
                för att svara på frågan!
              </p>
            </div>

            {/* URL i liten text för debug */}
            <p className="text-xs text-sand mt-8 break-all max-w-sm">
              {qrUrl}
            </p>
          </div>
        );
      })}
    </>
  );
}
