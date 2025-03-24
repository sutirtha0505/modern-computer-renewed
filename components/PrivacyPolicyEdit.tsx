import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  TextQuote
} from 'lucide-react';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 rounded-t-md bg-slate-800">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-700' : ''}`}
        title="Bold"
      >
        <Bold className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-700' : ''}`}
        title="Italic"
      >
        <Italic className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('underline') ? 'bg-slate-700' : ''}`}
        title="Underline"
      >
        <UnderlineIcon className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('bulletList') ? 'bg-slate-700' : ''}`}
        title="Bullet List"
      >
        <List className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive('orderedList') ? 'bg-slate-700' : ''}`}
        title="Ordered List"
      >
        <ListOrdered className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-700' : ''}`}
        title="Align Left"
      >
        <AlignLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-700' : ''}`}
        title="Align Center"
      >
        <AlignCenter className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-slate-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-700' : ''}`}
        title="Align Right"
      >
        <AlignRight className="w-5 h-5 text-white" />
      </button>
      <div className="flex items-center gap-2">
        <Type className="w-5 h-5 text-white" />
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="p-2 rounded border border-gray-600 bg-slate-700 text-white"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <TextQuote className="w-5 h-5 text-white" />
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="p-2 rounded border border-gray-600 bg-slate-700 text-white"
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
        </select>
      </div>
    </div>
  );
};

const PrivacyPolicyEdit = () => {
  const [privacyStatement, setPrivacyStatement] = useState("");
  const [refundStatement, setRefundStatement] = useState("");
  const [shippingStatement, setShippingStatement] = useState("");
  const [termsConditions, setTermsConditions] = useState("");

  const privacyEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: privacyStatement,
    onUpdate: ({ editor }) => {
      setPrivacyStatement(editor.getHTML());
    },
  });

  const refundEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: refundStatement,
    onUpdate: ({ editor }) => {
      setRefundStatement(editor.getHTML());
    },
  });

  const shippingEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: shippingStatement,
    onUpdate: ({ editor }) => {
      setShippingStatement(editor.getHTML());
    },
  });

  const termsEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: termsConditions,
    onUpdate: ({ editor }) => {
      setTermsConditions(editor.getHTML());
    },
  });

  const fetchLastEntry = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("privacy_policy")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const lastEntry = data[0];
        setPrivacyStatement(lastEntry.privacy_statement || "");
        setRefundStatement(lastEntry.refund_statement || "");
        setShippingStatement(lastEntry.shipping_statement || "");
        setTermsConditions(lastEntry.terms_n_conditions_statement || "");
        
        // Update editor contents
        if (privacyEditor) privacyEditor.commands.setContent(lastEntry.privacy_statement || "");
        if (refundEditor) refundEditor.commands.setContent(lastEntry.refund_statement || "");
        if (shippingEditor) shippingEditor.commands.setContent(lastEntry.shipping_statement || "");
        if (termsEditor) termsEditor.commands.setContent(lastEntry.terms_n_conditions_statement || "");
      }
    } catch (error) {
      console.error("Error fetching last entry:", error);
      toast.error("Failed to fetch previous data");
    }
  }, []);

  useEffect(() => {
    fetchLastEntry();
  }, [fetchLastEntry]);

  const handleSubmit = async () => {
    if (!privacyStatement || !refundStatement || !shippingStatement || !termsConditions) {
      toast.error("All fields are required");
      return;
    }

    try {
      const { error } = await supabase.from("privacy_policy").upsert({
        privacy_statement: privacyStatement,
        refund_statement: refundStatement,
        shipping_statement: shippingStatement,
        terms_n_conditions_statement: termsConditions,
      });

      if (error) {
        throw error;
      }

      toast.success("Privacy policy updated successfully");
      setPrivacyStatement("");
      setRefundStatement("");
      setShippingStatement("");
      setTermsConditions("");
      
      // Clear editor contents
      if (privacyEditor) privacyEditor.commands.setContent("");
      if (refundEditor) refundEditor.commands.setContent("");
      if (shippingEditor) shippingEditor.commands.setContent("");
      if (termsEditor) termsEditor.commands.setContent("");
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      toast.error("Failed to update privacy policy");
    }
  };

  return (
    <div className="w-full h-full min-h-screen justify-center items-center flex">
      <div className="w-[80%] h-auto flex flex-col justify-center items-center bg-slate-700 rounded-md px-12 py-8 gap-4">
        <h1 className="font-bold">
          Edit Your <span className="text-indigo-400">Privacy Page</span>
        </h1>
        <div className="w-full flex flex-col justify-center items-center">
          <label htmlFor="privacyStatement" className="block text-white">
            Privacy Statement
          </label>
          <div className="w-full rounded-md bg-slate-800">
            <MenuBar editor={privacyEditor} />
            <EditorContent editor={privacyEditor} className="prose max-w-none p-4 min-h-[500px]  rounded-b-md [&_.ProseMirror]:border-2 [&_.ProseMirror]:border-white [&_.ProseMirror]:min-h-[500px]" />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <label htmlFor="refundStatement" className="block text-white">
            Refund Statement
          </label>
          <div className="w-full rounded-md  bg-slate-800">
            <MenuBar editor={refundEditor} />
            <EditorContent editor={refundEditor} className="prose max-w-none p-4 min-h-[500px]  rounded-b-md [&_.ProseMirror]:border-2 [&_.ProseMirror]:border-white [&_.ProseMirror]:min-h-[500px]" />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <label htmlFor="shippingStatement" className="block text-white">
            Shipping Statement
          </label>
          <div className="w-full rounded-md  bg-slate-800">
            <MenuBar editor={shippingEditor} />
            <EditorContent editor={shippingEditor} className="prose max-w-none p-4 min-h-[500px]  rounded-b-md [&_.ProseMirror]:border-2 [&_.ProseMirror]:border-white [&_.ProseMirror]:min-h-[500px]" />
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <label htmlFor="termsConditions" className="block text-white">
            Terms and Conditions
          </label>
          <div className="w-full rounded-md  bg-slate-800">
            <MenuBar editor={termsEditor} />
            <EditorContent editor={termsEditor} className="prose max-w-none p-4 min-h-[500px]  rounded-b-md [&_.ProseMirror]:border-2 [&_.ProseMirror]:border-white [&_.ProseMirror]:min-h-[500px]" />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 px-4 py-1 rounded-md text-l hover:text-l hover:font-bold duration-200"
        >
          Submit
        </button>
        <ToastContainer />
      </div>
    </div>
  );
};

export default PrivacyPolicyEdit;
