'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useState, useCallback, useEffect } from 'react'
import { CATEGORIAS, MUNICIPIOS, type Noticia } from '@/lib/types'
import GerenciadorImagens, { type ImagemItem } from '@/components/admin/GerenciadorImagens'
import { compressImage } from '@/lib/compress-image'

interface EditorMateriaProps {
  initialData?: Partial<Noticia>
  onSave: (data: Partial<Noticia>, publish: boolean) => Promise<void>
  isLoading?: boolean
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-800 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

export default function EditorMateria({ initialData, onSave, isLoading }: EditorMateriaProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo ?? '')
  const [resumo, setResumo] = useState(initialData?.resumo ?? '')
  const [categoria, setCategoria] = useState(initialData?.categoria ?? 'Geral')
  const [autor, setAutor] = useState(initialData?.autor ?? 'Redação Conexão Oeste')
  const [imagemUrl, setImagemUrl] = useState(initialData?.imagem_url ?? '')
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
  const [metaTitleManual, setMetaTitleManual] = useState(!!initialData?.meta_title)
  const [metaDescManual, setMetaDescManual] = useState(!!initialData?.meta_description)
  const [destaque, setDestaque] = useState(initialData?.destaque ?? false)
  const [cidadePrefeitura, setCidadePrefeitura] = useState(initialData?.cidade_prefeitura ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagem_url ?? '')
  const [imagemPosicao, setImagemPosicao] = useState<string>(initialData?.imagem_posicao ?? '50% 50%')
  const [galeria, setGaleria] = useState<ImagemItem[]>([])
  const [galeriaCarregada, setGaleriaCarregada] = useState(!initialData?.id)
  const [saving, setSaving] = useState(false)

  // Carregar imagens existentes da galeria
  useEffect(() => {
    if (!initialData?.id) return
    fetch(`/api/admin/noticias/${initialData.id}/imagens`)
      .then(r => r.ok ? r.json() : [])
      .then((imgs: ImagemItem[]) => {
        setGaleria(imgs)
        setGaleriaCarregada(true)
      })
      .catch(() => setGaleriaCarregada(true))
  }, [initialData?.id])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: initialData?.conteudo ?? '<p>Escreva o conteúdo da matéria aqui...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] focus:outline-none p-4',
      },
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (publish: boolean) => {
    if (!titulo.trim()) {
      alert('O título é obrigatório')
      return
    }

    setSaving(true)
    try {
      let finalImageUrl = imagemUrl

      // Upload image if a new file was selected
      if (imageFile) {
        const compressed = await compressImage(imageFile)
        const formData = new FormData()
        formData.append('file', compressed)
        const uploadRes = await fetch('/api/admin/upload-imagem', {
          method: 'POST',
          body: formData,
        })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          finalImageUrl = url
        } else {
          throw new Error('Erro ao fazer upload da imagem')
        }
      }

      // Usar primeira imagem da galeria como capa se não tiver imagem principal
      const galeriaUrl = galeria.length > 0 ? galeria[0].url : undefined
      const imagemFinal = finalImageUrl || galeriaUrl || undefined

      await onSave(
        {
          titulo,
          resumo: resumo || undefined,
          conteudo: editor?.getHTML() ?? '',
          categoria,
          autor,
          imagem_url: imagemFinal,
          imagem_posicao: imagemPosicao,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          destaque,
          cidade_prefeitura: cidadePrefeitura || undefined,
          // Só envia a galeria se já foi carregada do servidor, para não apagar imagens existentes
          _galeria: galeriaCarregada ? galeria : undefined,
        } as Partial<Noticia> & { _galeria?: ImagemItem[] },
        publish
      )
    } finally {
      setSaving(false)
    }
  }

  const addImage = useCallback(() => {
    const url = window.prompt('URL da imagem:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const url = window.prompt('URL do link:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value)
            if (!metaTitleManual) setMetaTitle(e.target.value.slice(0, 60))
          }}
          placeholder="Título da matéria"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
        <textarea
          value={resumo}
          onChange={(e) => {
            setResumo(e.target.value)
            if (!metaDescManual) setMetaDescription(e.target.value.slice(0, 155))
          }}
          rows={2}
          placeholder="Resumo curto para listagem (2-3 frases)"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Row: Category + Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* City (if Prefeitura) */}
      {categoria === 'Prefeitura' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
          <select
            value={cidadePrefeitura}
            onChange={(e) => setCidadePrefeitura(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o município</option>
            {MUNICIPIOS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">ou URL:</span>
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => { setImagemUrl(e.target.value); setImagePreview(e.target.value) }}
                placeholder="https://..."
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {imagePreview && (
            <div className="flex-shrink-0 space-y-1">
              <div
                className="relative w-40 h-24 rounded overflow-hidden border border-gray-200 cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
                  setImagemPosicao(`${x}% ${y}%`)
                }}
                title="Clique para definir o ponto focal"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: imagemPosicao }} />
                {/* Marcador do ponto focal */}
                <div
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: imagemPosicao.split(' ')[0],
                    top: imagemPosicao.split(' ')[1],
                  }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-md bg-blue-500/60" />
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">Clique para ajustar foco</p>
            </div>
          )}
        </div>
      </div>

      {/* Galeria */}
      {galeriaCarregada ? (
        <GerenciadorImagens imagens={galeria} onChange={setGaleria} />
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 text-sm text-gray-400 text-center">
          Carregando imagens...
        </div>
      )}

      {/* Rich text editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive('bold')}
              title="Negrito"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive('italic')}
              title="Itálico"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor?.isActive('heading', { level: 2 })}
              title="Subtítulo H2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor?.isActive('heading', { level: 3 })}
              title="Subtítulo H3"
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive('bulletList')}
              title="Lista"
            >
              &bull;
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={editor?.isActive('blockquote')}
              title="Citação"
            >
              &ldquo;&rdquo;
            </ToolbarButton>
            <ToolbarButton onClick={setLink} active={editor?.isActive('link')} title="Link">
              Link
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Imagem inline">
              Img
            </ToolbarButton>
            <div className="w-px bg-gray-300 mx-1" />
            <ToolbarButton
              onClick={() => editor?.chain().focus().undo().run()}
              title="Desfazer"
            >
              &#8617;
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().redo().run()}
              title="Refazer"
            >
              &#8618;
            </ToolbarButton>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">SEO</h3>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Meta Title <span className="text-gray-400">(máx 60 caracteres)</span>
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => { setMetaTitle(e.target.value); setMetaTitleManual(true) }}
            maxLength={60}
            placeholder="Deixe em branco para usar o título"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">{metaTitle.length}/60</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Meta Description <span className="text-gray-400">(máx 155 caracteres)</span>
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => { setMetaDescription(e.target.value); setMetaDescManual(true) }}
            maxLength={155}
            rows={2}
            placeholder="Deixe em branco para usar o resumo"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-0.5">{metaDescription.length}/155</p>
        </div>
      </div>

      {/* Destaque */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={destaque}
          onChange={(e) => setDestaque(e.target.checked)}
          className="w-4 h-4 accent-blue-700"
        />
        <span className="text-sm font-medium text-gray-700">Marcar como destaque na home</span>
      </label>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => handleSave(false)}
          disabled={saving || isLoading}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar Rascunho'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || isLoading}
          className="px-6 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          {saving ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
