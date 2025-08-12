'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Shield, Clock, Users, FileText, Globe, Lock, AlertTriangle } from 'lucide-react'

export default function DataProcessingRecord() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Database className="h-10 w-10 text-blue-600" />
            Verzeichnis von Verarbeitungstätigkeiten
          </h1>
          <p className="text-lg text-gray-600">
            Art. 30 DSGVO - Dokumentation aller Datenverarbeitungen
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Stand: {new Date().toLocaleDateString('de-DE')} • Version 1.0
          </p>
        </div>

        <div className="space-y-6">

          {/* Processing Activity 1: Terminbuchung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-6 w-6 text-blue-600" />
                1. Terminbuchung und -verwaltung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🎯 Zweck der Verarbeitung</h4>
                    <p className="text-sm text-gray-700">
                      Terminvereinbarung, Terminverwaltung, Erinnerungsservice, Rechnungsstellung
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">👥 Kategorien betroffener Personen</h4>
                    <p className="text-sm text-gray-700">
                      Patienten, Interessenten, gesetzliche Vertreter
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📋 Kategorien personenbezogener Daten</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Stammdaten (Name, E-Mail, Telefon)</li>
                      <li>• Terminwünsche und -zeiten</li>
                      <li>• Zahlungsinformationen (PayPal-Daten)</li>
                      <li>• Session-Präferenzen</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">⚖️ Rechtsgrundlage</h4>
                    <p className="text-sm text-gray-700">
                      Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)<br />
                      Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📤 Empfänger der Daten</h4>
                    <p className="text-sm text-gray-700">
                      PayPal Holdings Inc. (Zahlungsabwicklung)<br />
                      Praxisinhaber und autorisiertes Personal
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">⏱️ Löschfristen</h4>
                    <p className="text-sm text-gray-700">
                      10 Jahre nach letztem Kontakt (Aufbewahrungspflicht HGB/AO)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Activity 2: Medizinische Daten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-6 w-6 text-red-600" />
                2. Medizinische Datenverarbeitung
              </CardTitle>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Besondere Kategorien personenbezogener Daten (Art. 9 DSGVO)
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🎯 Zweck der Verarbeitung</h4>
                    <p className="text-sm text-gray-700">
                      Therapeutische Behandlung, Anamnese, Therapieplanung, Dokumentationspflicht
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">👥 Kategorien betroffener Personen</h4>
                    <p className="text-sm text-gray-700">
                      Patienten, gesetzliche Vertreter bei Minderjährigen
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">🏥 Kategorien von Gesundheitsdaten</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Anamnese und Krankheitsgeschichte</li>
                      <li>• Aktuelle Beschwerden</li>
                      <li>• Medikation und Allergien</li>
                      <li>• Therapieziele und -verlauf</li>
                      <li>• Notfallkontakte</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">⚖️ Rechtsgrundlage (Art. 9 DSGVO)</h4>
                    <p className="text-sm text-gray-700">
                      Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsvorsorge)<br />
                      Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)<br />
                      + Explizite Einwilligung des Betroffenen
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibent mb-2">📤 Empfänger der Daten</h4>
                    <p className="text-sm text-gray-700">
                      Nur Therapeut und autorisiertes Praxispersonal<br />
                      Keine Weitergabe an Dritte ohne Einwilligung
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">⏱️ Löschfristen</h4>
                    <p className="text-sm text-gray-700">
                      <strong>10 Jahre</strong> nach letztem Behandlungskontakt<br />
                      (§ 630f BGB - Behandlungsvertrag)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Activity 3: Website Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-6 w-6 text-green-600" />
                3. Website-Analytik und Marketing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🎯 Zweck der Verarbeitung</h4>
                    <p className="text-sm text-gray-700">
                      Website-Optimierung, Nutzerverhalten-Analyse, Marketingmaßnahmen
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">👥 Kategorien betroffener Personen</h4>
                    <p className="text-sm text-gray-700">
                      Website-Besucher, Newsletter-Abonnenten
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📋 Kategorien personenbezogener Daten</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• IP-Adresse (pseudonymisiert)</li>
                      <li>• Browser-Informationen</li>
                      <li>• Besuchszeiten und -dauer</li>
                      <li>• Referrer-URLs</li>
                      <li>• Cookie-IDs</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">⚖️ Rechtsgrundlage</h4>
                    <p className="text-sm text-gray-700">
                      Art. 6 Abs. 1 lit. a DSGVO (Einwilligung über Cookie-Banner)<br />
                      Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">📤 Empfänger der Daten</h4>
                    <p className="text-sm text-gray-700">
                      Nur bei expliziter Einwilligung:<br />
                      Analytics-Dienstleister, Marketing-Tools
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">⏱️ Löschfristen</h4>
                    <p className="text-sm text-gray-700">
                      Analytics: 26 Monate<br />
                      Marketing: Bis zum Widerruf<br />
                      Cookies: Gemäß Cookie-Einstellungen
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical and Organizational Measures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-6 w-6 text-purple-600" />
                4. Technische und organisatorische Maßnahmen (Art. 32 DSGVO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Verschlüsselung
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• HTTPS/TLS 1.3 für alle Verbindungen</li>
                    <li>• AES-256 Verschlüsselung für Datenbank</li>
                    <li>• Verschlüsselte Datensicherung</li>
                    <li>• Ende-zu-Ende Verschlüsselung bei E-Mails</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Zugriffskontrolle
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Rollenbasierte Berechtigungen</li>
                    <li>• Zwei-Faktor-Authentifizierung</li>
                    <li>• Protokollierung aller Zugriffe</li>
                    <li>• Regelmäßige Zugriffsrechte-Prüfung</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-orange-600" />
                    Datenintegrität
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Automatische Backups (täglich)</li>
                    <li>• Checksummen-Prüfung</li>
                    <li>• Versionskontrolle aller Änderungen</li>
                    <li>• Disaster Recovery Plan</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Überwachung und Wartung
                </h4>
                <p className="text-sm text-gray-700">
                  Kontinuierliche Sicherheitsüberwachung, regelmäßige Penetrationstests, 
                  monatliche Sicherheitsupdates, vierteljährliche Datenschutz-Audits
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Processors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-6 w-6 text-indigo-600" />
                5. Auftragsverarbeiter (Art. 28 DSGVO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">💳 PayPal Holdings, Inc.</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>
                      <strong>Zweck:</strong> Zahlungsabwicklung
                    </div>
                    <div>
                      <strong>Standort:</strong> USA (Angemessenheitsbeschluss)
                    </div>
                    <div>
                      <strong>AV-Vertrag:</strong> ✅ Vorhanden
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🌐 Hosting-Provider</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>
                      <strong>Zweck:</strong> Website-Hosting, Datenbank
                    </div>
                    <div>
                      <strong>Standort:</strong> Deutschland/EU
                    </div>
                    <div>
                      <strong>AV-Vertrag:</strong> ✅ Vorhanden
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Transfers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                6. Datenübermittlung in Drittländer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold mb-2">🇺🇸 PayPal (USA)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Rechtsgrundlage:</strong> Angemessenheitsbeschluss der EU-Kommission für die USA
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Zusätzliche Garantien:</strong> Standardvertragsklauseln (SCC), 
                    Privacy Shield Nachfolger-Regelungen
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold mb-2">🇪🇺 EU/EWR-Verarbeitung</h4>
                  <p className="text-sm text-gray-700">
                    Alle medizinischen Daten und Hauptverarbeitung erfolgt ausschließlich 
                    auf Servern innerhalb der EU/EWR (Deutschland).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-6 w-6 text-blue-600" />
                7. Kontakt und Aktualisierung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">📧 Datenschutzbeauftragter</h4>
                  <p className="text-sm text-gray-700">
                    E-Mail: datenschutz@katyusha-therapy.de<br />
                    Telefon: [Telefonnummer]<br />
                    Postadresse: [Praxisadresse]
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📅 Letzte Aktualisierung</h4>
                  <p className="text-sm text-gray-700">
                    Datum: {new Date().toLocaleDateString('de-DE')}<br />
                    Version: 1.0<br />
                    Nächste Überprüfung: {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            Dieses Verzeichnis wird gemäß Art. 30 DSGVO geführt und regelmäßig aktualisiert.
          </p>
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Zurück zur Website
          </a>
        </div>
      </div>
    </div>
  )
}