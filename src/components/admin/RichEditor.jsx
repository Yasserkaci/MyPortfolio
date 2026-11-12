import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  Quotes,
  Minus,
  LinkSimple,
  ImageSquare,
  YoutubeLogo,
  ArrowCounterClockwise,
  ArrowClockwise,
  CodeBlock,
  TextT,
} from '@phosphor-icons/react'
import { uploadMedia } from '../../lib/supabase'
import { useToast } from './ui'

function B({ on, active, title, children }) {
  return (
    <button type="button" onClick={on} className={active ? 'is-active' : ''} title={title} aria-label={title}>
      {children}
    </button>
  )
}

export default function RichEditor({ value, onChange, placeholder = 'Tell the story of this project…' }) {
  const fileRef = useRef(null)
  const toast = useToast()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false }),
      Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { loading: 'lazy' } }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Placeholder.configure({ placeholder }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      handleDrop: (_view, event) => {
        const file = event.dataTransfer?.files?.[0]
        if (file && file.type.startsWith('image/')) {
          event.preventDefault()
          insertImage(file)
          return true
        }
        return false
      },
      handlePaste: (_view, event) => {
        const file = [...(event.clipboardData?.files || [])][0]
        if (file && file.type.startsWith('image/')) {
          event.preventDefault()
          insertImage(file)
          return true
        }
        return false
      },
    },
  })

  async function insertImage(file) {
    if (!editor || !file) return
    try {
      toast('Uploading image…')
      const url = await uploadMedia(file, 'content')
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run()
    } catch (e) {
      toast(e.message || 'Upload failed', 'error')
    }
  }

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Link URL', prev)
    if (url === null) return
    if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addYoutube = () => {
    const url = window.prompt('YouTube URL')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }

  if (!editor) return <div className="editor" style={{ minHeight: 420 }} />

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <B on={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">
          <TextT size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <TextHOne size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <TextHTwo size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <TextHThree size={18} />
        </B>
        <span className="sep" />
        <B on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <TextB size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <TextItalic size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <TextStrikethrough size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <Code size={18} />
        </B>
        <span className="sep" />
        <B on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <ListBullets size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListNumbers size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quotes size={18} />
        </B>
        <B on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <CodeBlock size={18} />
        </B>
        <B on={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={18} />
        </B>
        <span className="sep" />
        <B on={setLink} active={editor.isActive('link')} title="Link">
          <LinkSimple size={18} />
        </B>
        <B on={() => fileRef.current?.click()} title="Insert image">
          <ImageSquare size={18} />
        </B>
        <B on={addYoutube} title="Embed YouTube video">
          <YoutubeLogo size={18} />
        </B>
        <span className="sep" />
        <B on={() => editor.chain().focus().undo().run()} title="Undo">
          <ArrowCounterClockwise size={18} />
        </B>
        <B on={() => editor.chain().focus().redo().run()} title="Redo">
          <ArrowClockwise size={18} />
        </B>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            insertImage(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
      <EditorContent editor={editor} className="prose" />
    </div>
  )
}
