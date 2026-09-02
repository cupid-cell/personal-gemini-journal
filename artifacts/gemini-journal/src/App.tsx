import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowUp, BookOpen, Check, ChevronDown, CircleHelp, Feather,
  GitBranch, History, KeyRound, Lightbulb, LockKeyhole, Menu, MessageCircle,
  Plus, Settings2, ShieldCheck, Sparkles, X, LogOut,
} from 'lucide-react';
import {
  Route, Switch, useLocation, Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Conversation = {
  id: string;
  title: string;
  preview: string;
  date: string;
  messages: { role: 'user' | 'gemini'; text: string }[];
};

const initialConversations: Conversation[] = [
  {
    id: 'quiet-monday',
    title: 'A quieter kind of ambition',
    preview: 'I keep thinking about what enough could look like...',
    date: 'Today',
    messages: [
      { role: 'user', text: 'I keep thinking about what enough could look like. I’m not sure I want to keep chasing the loudest version of success.' },
      { role: 'gemini', text: 'There’s something generous in that question. It sounds less like you’re lowering the bar, and more like you’re choosing which room you want the bar to live in.' },
      { role: 'user', text: 'That feels true. I think I want ambition that leaves some light on for the rest of my life.' },
      { role: 'gemini', text: 'Maybe your next definition of ambition is not “more,” but “more of what lets you remain recognizable to yourself.” What would that make possible this week?' },
    ],
  },
  {
    id: 'moving-cities',
    title: 'The shape of a new city',
    preview: 'A city can be a question you agree to live inside...',
    date: 'Yesterday',
    messages: [
      { role: 'user', text: 'A city can be a question you agree to live inside. I wonder if I’m ready to move again.' },
      { role: 'gemini', text: 'What are you hoping the next place will make easier to hear?' },
    ],
  },
  {
    id: 'boundaries',
    title: 'A note on being available',
    preview: 'I answered too quickly again, before asking what I needed.',
    date: 'May 18',
    messages: [
      { role: 'user', text: 'I answered too quickly again, before asking what I needed.' },
      { role: 'gemini', text: 'The pause before a yes can be a small way of staying in the conversation with yourself.' },
    ],
  },
];

const reflectionThreads = [
  { id: 'enough', title: 'The shape of enough', count: 6, prompt: 'Where are you practicing “enough” instead of reaching for more?' },
  { id: 'room', title: 'Making room for the unknown', count: 4, prompt: 'What would you do if you did not need to know the whole path yet?' },
  { id: 'pace', title: 'A pace you can inhabit', count: 3, prompt: 'What kind of pace lets you stay close to what matters?' },
];

function LogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-[13px] bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-sm" aria-label="Gemini Journal">
      <Feather size={18} strokeWidth={1.8} />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
    </div>
  );
}

function SignedOut({ onSignIn }: { onSignIn: () => void }) {
  return (
    <main className="paper-grain flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[hsl(var(--accent)/.22)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[hsl(var(--sidebar-primary)/.18)] blur-3xl" />
      <section className="animate-rise relative grid w-full max-w-[1060px] overflow-hidden rounded-[30px] border border-border bg-card shadow-lg md:grid-cols-[1.08fr_.92fr]">
        <div className="flex min-h-[600px] flex-col justify-between bg-[hsl(var(--sidebar))] p-8 text-[hsl(var(--sidebar-foreground))] md:p-12">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="text-sm font-semibold tracking-[-.01em]">Gemini Journal</span>
            </div>
            <div className="mt-24 max-w-md">
              <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[hsl(var(--sidebar-primary))]">A private thinking space</p>
              <h1 className="font-display mt-5 text-6xl leading-[.9] tracking-[-.04em] md:text-8xl">Make room<br /><em>for the thought.</em></h1>
              <p className="mt-8 max-w-sm text-[15px] leading-7 text-[hsl(var(--sidebar-foreground)/.68)]">A quiet place to write things down, think alongside Gemini, and notice what keeps returning.</p>
            </div>
          </div>
          <div className="mt-16 flex items-center gap-3 text-xs text-[hsl(var(--sidebar-foreground)/.5)]">
            <LockKeyhole size={14} />
            <span>Your journal is yours. Always.</span>
          </div>
        </div>
        <div className="flex flex-col justify-center bg-card p-8 md:p-14">
          <div className="mb-10">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-muted-foreground">Welcome back</p>
            <h2 className="font-display mt-3 text-4xl tracking-[-.025em] text-foreground">Sign in to your journal</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Pick up a thought exactly where you left it.</p>
          </div>
          <button type="button" onClick={onSignIn} data-testid="button-sign-in-google" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.5)] hover:shadow-sm active:translate-y-0">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[hsl(var(--primary))] text-[11px] font-bold text-primary-foreground">G</span>
            Continue with Google
          </button>
          <div className="my-7 flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> secure sign-in <span className="h-px flex-1 bg-border" />
          </div>
          <p className="text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to keep this space kind, private, and yours.</p>
          <div className="mt-12 rounded-2xl border border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.16)] p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" size={17} />
              <div><p className="text-xs font-semibold text-foreground">Private by design</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your entries are not used to personalize ads. We’ll always tell you what is saved.</p></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Sidebar({
  activeView, setActiveView, conversations, selectedId, onSelectConversation, onNew, onSignOut, mobileOpen, onClose,
}: {
  activeView: string; setActiveView: (value: string) => void; conversations: Conversation[]; selectedId: string;
  onSelectConversation: (id: string) => void; onNew: () => void; onSignOut: () => void; mobileOpen: boolean; onClose: () => void;
}) {
  const nav = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'threads', label: 'Reflection threads', icon: GitBranch },
    { id: 'history', label: 'All entries', icon: History },
  ];
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[hsl(var(--sidebar))] p-5 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><LogoMark /><span className="text-sm font-semibold">Gemini Journal</span></div>
        <button type="button" onClick={onClose} data-testid="button-close-sidebar" className="rounded-lg p-1.5 text-[hsl(var(--sidebar-foreground)/.6)] hover:bg-[hsl(var(--sidebar-accent))] md:hidden"><X size={17} /></button>
      </div>
      <button type="button" onClick={onNew} data-testid="button-new-entry" className="mt-9 flex h-11 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--sidebar-primary))] text-sm font-semibold text-[hsl(var(--sidebar-primary-foreground))] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"><Plus size={17} /> New entry</button>
      <nav className="mt-7 space-y-1" aria-label="Main navigation">
        {nav.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} onClick={() => { setActiveView(id); onClose(); }} data-testid={`button-nav-${id}`} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeView === id ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.62)] hover:bg-[hsl(var(--sidebar-accent)/.65)] hover:text-[hsl(var(--sidebar-foreground))]'}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{id === 'threads' && <span className="ml-auto rounded-full bg-[hsl(var(--accent)/.85)] px-2 py-0.5 font-mono-ui text-[10px] text-foreground">3</span>}</button>
        ))}
      </nav>
      <div className="mt-9 flex items-center justify-between px-2"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.4)]">Recent entries</p><button type="button" onClick={() => setActiveView('history')} data-testid="button-view-all" className="text-[10px] text-[hsl(var(--sidebar-primary))] hover:underline">View all</button></div>
      <div className="scrollbar-subtle mt-3 flex-1 space-y-1 overflow-y-auto pr-1">
        {conversations.map((conversation) => <button type="button" key={conversation.id} onClick={() => { onSelectConversation(conversation.id); setActiveView('journal'); onClose(); }} data-testid={`button-conversation-${conversation.id}`} className={`w-full rounded-xl px-3 py-3 text-left transition ${selectedId === conversation.id && activeView === 'journal' ? 'bg-[hsl(var(--sidebar-accent))]' : 'hover:bg-[hsl(var(--sidebar-accent)/.65)]'}`}><p className="truncate text-[13px] font-medium">{conversation.title}</p><p className="mt-1 truncate text-[11px] text-[hsl(var(--sidebar-foreground)/.48)]">{conversation.preview}</p><p className="mt-2 font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--sidebar-foreground)/.35)]">{conversation.date}</p></button>)}
      </div>
      <div className="mt-5 border-t border-[hsl(var(--sidebar-border))] pt-4">
        <button type="button" onClick={() => setActiveView('privacy')} data-testid="button-privacy" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-[hsl(var(--sidebar-foreground)/.55)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"><LockKeyhole size={15} /> Privacy & security</button>
        <button type="button" onClick={onSignOut} data-testid="button-sign-out" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-[hsl(var(--sidebar-foreground)/.55)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"><LogOut size={15} /> Sign out</button>
        <div className="mt-4 flex items-center gap-3 px-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--accent))] text-xs font-semibold text-foreground">AM</div><div className="min-w-0"><p className="truncate text-xs font-semibold">Alex Morgan</p><p className="truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.43)]">alex@youremail.com</p></div><ChevronDown className="ml-auto text-[hsl(var(--sidebar-foreground)/.4)]" size={14} /></div>
      </div>
    </aside>
  );
}

function GeminiMark() {
  return <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[hsl(var(--primary)/.13)] text-[hsl(var(--primary))]"><Sparkles size={15} /></div>;
}

function ConversationView({ conversation, onSend }: { conversation: Conversation; onSend: (text: string) => void }) {
  const [draft, setDraft] = useState('');
  const submit = () => { if (draft.trim()) { onSend(draft.trim()); setDraft(''); } };
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-9 animate-rise">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Journal entry · {conversation.date}</p>
            <h1 className="font-display mt-3 text-4xl leading-tight tracking-[-.03em] text-foreground md:text-5xl">{conversation.title}</h1>
          </div>
          <div className="space-y-8">
            {conversation.messages.map((message, index) => message.role === 'user' ? (
              <div key={`${conversation.id}-${index}`} className="animate-rise-delay flex justify-end"><div data-testid={`text-user-message-${index}`} className="max-w-[88%] rounded-[20px] rounded-br-md bg-[hsl(var(--secondary))] px-5 py-4 text-[15px] leading-7 text-foreground md:max-w-[78%]">{message.text}</div></div>
            ) : (
              <div key={`${conversation.id}-${index}`} className="animate-rise-delay flex gap-3"><GeminiMark /><div data-testid={`text-gemini-message-${index}`} className="max-w-[90%] pt-1 text-[15px] leading-7 text-foreground/80">{message.text}</div></div>
            ))}
          </div>
          {conversation.messages.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center"><p className="font-display text-2xl">Start wherever you are.</p><p className="mt-2 text-sm text-muted-foreground">There is no right first sentence.</p></div>}
        </div>
      </div>
      <div className="border-t border-border bg-background/70 px-5 pb-5 pt-4 backdrop-blur-sm md:px-12 lg:px-20">
        <div className="mx-auto max-w-[720px]">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-sm transition focus-within:border-[hsl(var(--primary)/.5)] focus-within:shadow-md">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} data-testid="input-journal-message" rows={2} placeholder="What’s on your mind?" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground" />
            <div className="flex items-center justify-between px-2 pb-1"><span className="text-[10px] text-muted-foreground">Gemini will meet you here · Press Enter to send</span><button type="button" onClick={submit} disabled={!draft.trim()} data-testid="button-send-message" className="grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--primary))] text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp size={17} /></button></div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"><LockKeyhole size={11} /> Private to you · Saved automatically</div>
        </div>
      </div>
    </div>
  );
}

function ThreadView({ onOpen }: { onOpen: (prompt: string) => void }) {
  return (
    <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[900px]">
        <div className="animate-rise mb-10 flex items-end justify-between gap-5"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Patterns worth returning to</p><h1 className="font-display mt-3 text-5xl tracking-[-.035em]">Reflection threads</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Small questions that have begun to echo across your entries.</p></div><Lightbulb className="mb-2 hidden text-[hsl(var(--accent-foreground))] md:block" size={32} strokeWidth={1.2} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          {reflectionThreads.map((thread, index) => <button type="button" key={thread.id} onClick={() => onOpen(thread.prompt)} data-testid={`button-thread-${thread.id}`} className={`group relative overflow-hidden rounded-[22px] border border-border bg-card p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary)/.35)] hover:shadow-md ${index === 0 ? 'md:row-span-2 md:flex md:flex-col md:justify-between md:p-8' : ''}`}><div><div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground">{thread.count} entries</span><ArrowUp className="rotate-45 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1" size={17} /></div><h2 className={`font-display mt-10 text-3xl tracking-[-.02em] ${index === 0 ? 'md:text-5xl' : ''}`}>{thread.title}</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">{thread.prompt}</p></div><div className="mt-10 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">Open this thread <span className="transition group-hover:translate-x-1">→</span></div></button>)}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-border p-5 text-muted-foreground"><CircleHelp className="mt-0.5 shrink-0" size={17} /><p className="text-xs leading-5">Threads are gentle suggestions, not diagnoses. You can dismiss any pattern, or simply let it sit.</p></div>
      </div>
    </div>
  );
}

function HistoryView({ conversations, onSelect }: { conversations: Conversation[]; onSelect: (id: string) => void }) {
  return <div className="scrollbar-subtle flex-1 overflow-y-auto px-5 py-8 md:px-12 lg:px-20"><div className="mx-auto max-w-[900px]"><div className="animate-rise mb-10"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your archive</p><h1 className="font-display mt-3 text-5xl tracking-[-.035em]">All entries</h1><p className="mt-3 text-sm text-muted-foreground">{conversations.length} conversations, kept in your own time.</p></div><div className="space-y-2">{conversations.map((item) => <button type="button" key={item.id} onClick={() => onSelect(item.id)} data-testid={`button-history-${item.id}`} className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-card/55 p-4 text-left transition hover:-translate-y-0.5 hover:border-border hover:bg-card hover:shadow-sm"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><MessageCircle size={17} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.preview}</p></div><span className="font-mono-ui text-[10px] uppercase tracking-[.1em] text-muted-foreground">{item.date}</span><ArrowUp className="rotate-45 text-muted-foreground opacity-0 transition group-hover:opacity-100" size={16} /></button>)}</div></div></div>;
}

function PrivacyView() {
  return <div className="flex-1 overflow-y-auto px-5 py-8 md:px-12 lg:px-20"><div className="mx-auto max-w-[720px]"><div className="animate-rise"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">A note from us</p><h1 className="font-display mt-3 text-5xl tracking-[-.035em]">Your thoughts stay yours.</h1><p className="mt-5 text-base leading-7 text-muted-foreground">Gemini Journal is designed to feel like a room with a door. You decide what comes in, what stays, and when to leave.</p></div><div className="mt-10 space-y-3">{[{ icon: LockKeyhole, title: 'Private by default', text: 'Your entries are only visible to you and are never shared publicly.' }, { icon: KeyRound, title: 'You are in control', text: 'Export or delete your journal whenever you choose. No lock-in.' }, { icon: ShieldCheck, title: 'Clear conversations', text: 'We’ll make it clear when a thought is being sent to Gemini and what is saved.' }].map(({ icon: Icon, title, text }) => <div className="flex gap-4 rounded-2xl border border-border bg-card p-5" key={title}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon size={18} /></div><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}</div></div></div>;
}

function Workspace({ onSignOut }: { onSignOut: () => void }) {
  const [activeView, setActiveView] = useState('journal');
  const [selectedId, setSelectedId] = useState('quiet-monday');
  const [conversations, setConversations] = useState(initialConversations);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) ?? conversations[0], [conversations, selectedId]);
  const newEntry = () => {
    const fresh: Conversation = { id: `entry-${Date.now()}`, title: 'A new page', preview: 'Start a thought...', date: 'Just now', messages: [] };
    setConversations((items) => [fresh, ...items]); setSelectedId(fresh.id); setActiveView('journal'); setMobileOpen(false);
  };
  const sendMessage = (text: string) => {
    setConversations((items) => items.map((item) => item.id !== selectedId ? item : { ...item, title: item.messages.length === 0 ? text.slice(0, 34) : item.title, preview: text, date: 'Just now', messages: [...item.messages, { role: 'user', text }, { role: 'gemini', text: 'I’m here with you. Tell me a little more about the part that feels most alive right now.' }] }));
  };
  const openThread = (prompt: string) => { newEntry(); setTimeout(() => { setConversations((items) => items.map((item, index) => index === 0 ? { ...item, title: 'A reflection to return to', preview: prompt, messages: [{ role: 'gemini', text: prompt }] } : item)); }, 0); };
  return <div className="paper-grain flex min-h-[100dvh] bg-background"><Sidebar {...{ activeView, setActiveView, conversations, selectedId, onSelectConversation: setSelectedId, onNew: newEntry, onSignOut, mobileOpen, onClose: () => setMobileOpen(false) }} /><div className={`fixed inset-0 z-30 bg-[hsl(var(--sidebar)/.45)] backdrop-blur-sm md:hidden ${mobileOpen ? 'block' : 'hidden'}`} onClick={() => setMobileOpen(false)} /><main className="flex min-h-[100dvh] min-w-0 flex-1 flex-col"><header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-5 md:px-10"><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} data-testid="button-open-sidebar" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden"><Menu size={19} /></button><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="hidden sm:block">Alex’s space</span><span className="hidden sm:block text-border">/</span><span className="font-medium text-foreground">{activeView === 'journal' ? 'Journal' : activeView === 'threads' ? 'Reflection threads' : activeView === 'history' ? 'All entries' : 'Privacy & security'}</span></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => setActiveView('privacy')} data-testid="button-header-privacy" className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><LockKeyhole size={16} /></button><button type="button" onClick={() => setActiveView('settings')} data-testid="button-settings" className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"><Settings2 size={17} /></button><div className="ml-1 h-7 w-px bg-border" /><div data-testid="status-saved" className="hidden items-center gap-1.5 pl-2 text-[10px] text-muted-foreground sm:flex"><Check size={13} className="text-[hsl(var(--primary))]" /> Saved</div></div></header>{activeView === 'journal' && selected && <ConversationView conversation={selected} onSend={sendMessage} />}{activeView === 'threads' && <ThreadView onOpen={openThread} />}{activeView === 'history' && <HistoryView conversations={conversations} onSelect={(id) => { setSelectedId(id); setActiveView('journal'); }} />}{activeView === 'privacy' && <PrivacyView />}{activeView === 'settings' && <div className="flex flex-1 items-center justify-center p-8"><div className="text-center"><Settings2 className="mx-auto text-muted-foreground" size={28} /><p className="font-display mt-4 text-3xl">Settings are coming with care.</p><p className="mt-2 text-sm text-muted-foreground">For now, your journal is ready to use.</p><button type="button" onClick={() => setActiveView('journal')} data-testid="button-back-journal" className="mt-6 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to journal</button></div></div>}</main></div>;
}

function Home() {
  const [signedIn, setSignedIn] = useState(true);
  return signedIn ? <Workspace onSignOut={() => setSignedIn(false)} /> : <SignedOut onSignIn={() => setSignedIn(true)} />;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;