import { useRef, useState } from 'react'
import { scanWineLabel, type WineLabelData } from '@/services/gemini.service'

interface LabelScannerProps {
  onScanComplete: (data: WineLabelData) => void
  onClose: () => void
}

export function LabelScanner({ onScanComplete, onClose }: LabelScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      const base64 = result.split(',')[1]
      setImageData({ base64, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  async function handleScan() {
    if (!imageData) return
    setIsScanning(true)
    setError(null)
    try {
      const data = await scanWineLabel(imageData.base64, imageData.mimeType)
      onScanComplete(data)
    } catch {
      setError('Não consegui ler o rótulo. Tente uma foto mais nítida.')
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface-900 rounded-t-2xl p-6 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Escanear Rótulo</h2>
            <p className="text-sm text-white/50">Tire uma foto do rótulo para preencher automaticamente</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Preview ou área de upload */}
        {preview ? (
          <div className="relative mb-4 rounded-xl overflow-hidden bg-black aspect-[3/4] flex items-center justify-center">
            <img src={preview} alt="Rótulo" className="object-contain w-full h-full" />
            <button
              onClick={() => { setPreview(null); setImageData(null) }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[3/4] max-h-64 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 text-white/40 hover:border-gold-400 hover:text-gold-400 transition-colors mb-4"
          >
            <span className="text-5xl">📷</span>
            <span className="text-sm font-medium">Tirar foto ou escolher da galeria</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={preview ? handleScan : () => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-bordeaux-600 to-wine-700 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisando...
              </>
            ) : preview ? (
              '✨ Analisar Rótulo'
            ) : (
              '📷 Escolher Foto'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
