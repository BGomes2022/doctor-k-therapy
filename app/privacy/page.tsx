'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Mail, Phone, FileText, Users, Clock, Database } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            Datenschutzerklärung
          </h1>
          <p className="text-lg text-gray-600">
            Gültig ab: {new Date().toLocaleDateString('de-DE')} • Version 1.0
          </p>
        </div>

        <div className="space-y-6">
          {/* Verantwortlicher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                1. Verantwortlicher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Katyusha Therapy</h3>
                <div className="space-y-1 text-gray-700">
                  <p>📍 [Adresse der Praxis]</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    [Telefonnummer]
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    [E-Mail-Adresse]
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist die oben genannte Praxis. 
                Der Verantwortliche entscheidet allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten.
              </p>
            </CardContent>
          </Card>

          {/* Datenverarbeitung */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                2. Datenverarbeitung auf dieser Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Terminbuchung */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold mb-2">🗓️ Terminbuchung</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Verarbeitete Daten:</strong> Name, E-Mail, Telefon, Terminwünsche</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
                  <p><strong>Zweck:</strong> Terminvereinbarung und -verwaltung</p>
                  <p><strong>Speicherdauer:</strong> Bis zur Durchführung des Termins + 3 Jahre (Dokumentationspflicht)</p>
                </div>
              </div>

              {/* Medizinische Daten */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold mb-2">🏥 Medizinische Daten (Besondere Kategorien)</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Verarbeitete Daten:</strong> Gesundheitsdaten, Anamnese, Therapieziele, Medikamente</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsvorsorge) + Art. 6 Abs. 1 lit. f DSGVO</p>
                  <p><strong>Zweck:</strong> Durchführung der therapeutischen Behandlung</p>
                  <p><strong>Einwilligung:</strong> Explizite Einwilligung im Anmeldeformular erforderlich</p>
                  <p><strong>Speicherdauer:</strong> 10 Jahre nach letztem Behandlungskontakt (§ 630f BGB)</p>
                </div>
              </div>

              {/* Zahlungsdaten */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold mb-2">💳 Zahlungsabwicklung</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Verarbeitete Daten:</strong> PayPal-Transaktionsdaten, Rechnungsinformationen</p>
                  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>
                  <p><strong>Drittanbieter:</strong> PayPal (PayPal Holdings, Inc., USA) - Angemessenheitsbeschluss</p>
                  <p><strong>Speicherdauer:</strong> 10 Jahre (Aufbewahrungspflicht HGB/AO)</p>
                </div>
              </div>

              {/* Cookies */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold mb-2">🍪 Cookies und Tracking</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Notwendige Cookies:</strong> Session-Management, Sicherheit</p>
                  <p><strong>Analyse-Cookies:</strong> Nur mit Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</p>
                  <p><strong>Marketing-Cookies:</strong> Nur mit Ihrer Einwilligung</p>
                  <p><strong>Verwaltung:</strong> Über Cookie-Banner einstellbar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betroffenenrechte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                3. Ihre Rechte (Art. 12-22 DSGVO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">✅ Auskunftsrecht (Art. 15)</h4>
                    <p className="text-sm text-gray-600">Informationen über Ihre gespeicherten Daten</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">✏️ Berichtigungsrecht (Art. 16)</h4>
                    <p className="text-sm text-gray-600">Korrektur unrichtiger Daten</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">🗑️ Löschungsrecht (Art. 17)</h4>
                    <p className="text-sm text-gray-600">"Recht auf Vergessenwerden"</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">⏸️ Einschränkungsrecht (Art. 18)</h4>
                    <p className="text-sm text-gray-600">Sperrung der Datenverarbeitung</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">📤 Datenportabilität (Art. 20)</h4>
                    <p className="text-sm text-gray-600">Übertragung an anderen Anbieter</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">❌ Widerspruchsrecht (Art. 21)</h4>
                    <p className="text-sm text-gray-600">Widerspruch gegen Verarbeitung</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold mb-2">🔒 Besonderheit bei Gesundheitsdaten:</h4>
                <p className="text-sm text-gray-700">
                  Aufgrund gesetzlicher Aufbewahrungsfristen (§ 630f BGB - 10 Jahre) können medizinische Daten 
                  nicht vorzeitig gelöscht werden. Nach Ablauf der Frist erfolgt automatische Löschung.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Datensicherheit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                4. Datensicherheit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🔐 Verschlüsselung</h4>
                    <p className="text-sm text-gray-700">HTTPS/TLS-Verschlüsselung für alle Datenübertragungen</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">💾 Speicherung</h4>
                    <p className="text-sm text-gray-700">Sichere Server in Deutschland (DSGVO-konform)</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">👥 Zugriffskontrolle</h4>
                    <p className="text-sm text-gray-700">Nur autorisiertes Personal hat Zugang</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Dokumentation</h4>
                    <p className="text-sm text-gray-700">Vollständige Logging aller Zugriffe</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kontakt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                5. Kontakt & Beschwerden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📧 Datenschutz-Anfragen</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>E-Mail: datenschutz@katyusha-therapy.de</p>
                    <p>Betreff: "DSGVO-Anfrage - [Ihr Anliegen]"</p>
                    <p className="text-sm text-gray-600">
                      Antwort innerhalb von 30 Tagen gemäß Art. 12 DSGVO
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">⚖️ Aufsichtsbehörde</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>Landesbeauftragte für Datenschutz</p>
                    <p>[Je nach Bundesland]</p>
                    <p className="text-sm text-gray-600">
                      Recht auf Beschwerde bei Datenschutzverstößen
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Änderungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                6. Änderungen dieser Datenschutzerklärung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren, um sie an veränderte 
                Rechtslage oder Änderungen unserer Services anzupassen. Die jeweils aktuelle Version finden Sie auf dieser Seite.
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                <strong>Letztes Update:</strong> {new Date().toLocaleDateString('de-DE')} • 
                <strong>Version:</strong> 1.0
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
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