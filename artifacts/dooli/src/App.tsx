import { useEffect, useMemo, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clipboard,
  FileText,
  Filter,
  Image as ImageIcon,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

type Category = 'Build' | 'Customer' | 'Bug' | 'Signal' | 'Life';
type Channel = 'Twitter / X' | 'LinkedIn' | 'Reddit';

type DiaryEntry = {
  id: string;
  title: string;
  body: string;
  category: Category;
  tags: string[];
  date: string;
  attachment?: { name: string; data?: string };
};

const STORAGE_KEY = 'dooli-entries-v1';
const categories: Category[] = ['Build', 'Customer', 'Bug', 'Signal', 'Life'];

const seedEntries: DiaryEntry[] = [
  {
    id: 'seed-1',
    title: 'The first person found the tiny thing',
    body: 'Mara replied to the welcome email and mentioned the keyboard shortcut we almost left undocumented. She said it made Dooli feel like it was made for her. Tiny detail, real signal.',
    category: 'Customer',
    tags: ['customer-love', 'onboarding'],
    date: '2024-06-18T09:30:00.000Z',
  },
  {
    id: 'seed-2',
    title: 'A bug with a surprisingly good ending',
    body: 'The timeline was showing yesterday twice when the timezone changed. Fixed it, then realized the same date helper was quietly wrong in three other places. A boring bug that cleaned up the whole foundation.',
    category: 'Bug',
    tags: ['fix', 'foundations'],
    date: '2024-06-16T15:10:00.000Z',
  },
  {
    id: 'seed-3',
    title: 'Made the blank screen feel less blank',
    body: 'Spent the morning on the first-run experience. The product now asks a useful question instead of presenting an empty room. It feels more like opening a notebook.',
    category: 'Build',
    tags: ['design', 'first-run'],
    date: '2024-06-14T11:45:00.000Z',
  },
];

function readEntries(): DiaryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as DiaryEntry[];
  } catch {
    // A malformed local value should never keep the journal from opening.
  }
  return seedEntries;
}

function persistEntries(entries: DiaryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(date));
}

function categoryTone(category: Category) {
  return {
    Build: 'bg-[#e4efe7] text-[#2d5b43]',
    Customer: 'bg-[#fae6dc] text-[#944a37]',
    Bug: 'bg-[#f4dfdf] text-[#983f4a]',
    Signal: 'bg-[#f8eec8] text-[#80631e]',
    Life: 'bg-[#e7e4f0] text-[#55496f]',
  }[category];
}

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [location, setLocation] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    setEntries(readEntries());
    setLoaded(true);
  }, []);

  const saveEntry = (entry: DiaryEntry) => {
    setEntries((current) => {
      const next = current.some((item) => item.id === entry.id)
        ? current.map((item) => item.id === entry.id ? entry : item)
        : [entry, ...current];
      persistEntries(next);
      return next;
    });
    setLocation(`/entry/${entry.id}`);
  };

  const deleteEntry = (id: string) => {
    setEntries((current) => {
      const next = current.filter((entry) => entry.id !== id);
      persistEntries(next);
      return next;
    });
    setLocation('/');
  };

  if (!loaded) return <LoadingScreen />;

  const selectedId = location.startsWith('/entry/') ? location.split('/')[2] : undefined;
  const selectedEntry = entries.find((entry) => entry.id === selectedId);

  return (
    <div className="dooli-shell min-h-[100dvh] bg-[#f5f0e7]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1500px]">
        <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} onNew={() => { setMobileNav(false); setLocation('/entry/new'); }} />
        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#dfd8cd]/80 bg-[#f5f0e7]/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
            <button data-testid="button-open-menu" onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-[#5e5c61] hover:bg-[#e9e0d3] lg:hidden"><Menu size={20} /></button>
            <div className="hidden items-center gap-2 text-xs text-[#7d7a78] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#e36851]" />
              Saved locally in this browser
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button data-testid="button-help" className="rounded-lg p-2 text-[#797674] transition hover:bg-[#e9e0d3] hover:text-[#2e3141]" title="About Dooli"><CircleHelp size={18} /></button>
              <button data-testid="button-profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#29394c] text-xs font-bold text-[#fbf6ed] transition hover:rotate-3">AD</button>
            </div>
          </div>
          <Switch>
            <Route path="/">
              <Timeline entries={entries} onOpen={(id) => setLocation(`/entry/${id}`)} onNew={() => setLocation('/entry/new')} />
            </Route>
            <Route path="/entry/new">
              <EntryEditor onSave={saveEntry} onCancel={() => setLocation('/')} />
            </Route>
            <Route path="/entry/:id">
              {selectedEntry ? <EntryDetail entry={selectedEntry} onBack={() => setLocation('/')} onEdit={() => setLocation(`/entry/${selectedEntry.id}/edit`)} onDelete={() => deleteEntry(selectedEntry.id)} /> : <NotFound onBack={() => setLocation('/')} />}
            </Route>
            <Route path="/entry/:id/edit">
              {selectedEntry ? <EntryEditor entry={selectedEntry} onSave={saveEntry} onCancel={() => setLocation(`/entry/${selectedEntry.id}`)} /> : <NotFound onBack={() => setLocation('/')} />}
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose, onNew }: { open: boolean; onClose: () => void; onNew: () => void }) {
  return (
    <>
      {open && <button data-testid="button-close-overlay" onClick={onClose} className="fixed inset-0 z-30 bg-[#202534]/30 lg:hidden" aria-label="Close menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] -translate-x-full border-r border-[#ded7cb] bg-[#f0eadf] px-5 py-6 transition-transform duration-300 lg:relative lg:translate-x-0 ${open ? 'translate-x-0' : ''}`}>
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#e36851] text-[#fff8ec] shadow-[3px_3px_0_#c55542]"><BookOpen size={18} strokeWidth={2.2} /></div>
            <span className="serif text-[26px] leading-none text-[#252a3a]">dooli</span>
          </div>
          <button data-testid="button-close-menu" onClick={onClose} className="rounded-lg p-1.5 text-[#8b847b] hover:bg-[#e3dbce] lg:hidden"><X size={18} /></button>
        </div>
        <button data-testid="button-new-entry" onClick={onNew} className="group mb-9 flex w-full items-center justify-between rounded-xl bg-[#29394c] px-4 py-3 text-left text-sm font-semibold text-[#fff8ec] shadow-[0_5px_0_#1c2937] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#1c2937] active:translate-y-0 active:shadow-[0_3px_0_#1c2937]">
          <span className="flex items-center gap-2"><Plus size={17} /> New entry</span><span className="mono text-[10px] text-[#b8c5ce]">N</span>
        </button>
        <nav className="space-y-1">
          <a data-testid="link-timeline" href="/" className="flex items-center gap-3 rounded-lg bg-[#e4dccf] px-3 py-2.5 text-sm font-semibold text-[#29394c]"><BookOpen size={17} /> Timeline</a>
          <div className="my-8 border-t border-[#d8d0c3]" />
          <p className="mono mb-3 px-3 text-[10px] uppercase tracking-[.16em] text-[#9b9288]">Your notebook</p>
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#666562]"><span className="flex items-center gap-3"><Tag size={16} /> Tags</span><span className="mono text-[10px] text-[#a39a8e]">soon</span></div>
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#666562]"><span className="flex items-center gap-3"><Sparkles size={16} /> Writing guide</span><span className="mono text-[10px] text-[#a39a8e]">soon</span></div>
        </nav>
        <div className="absolute bottom-7 left-5 right-5 rounded-xl border border-[#d9cfbf] bg-[#e8dfd2] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#e36851]"><Sparkles size={14} /><span className="mono text-[10px] uppercase tracking-wider">A note from Dooli</span></div>
          <p className="serif text-[17px] leading-[1.1] text-[#343949]">“The small things are usually the story.”</p>
        </div>
      </aside>
    </>
  );
}

function Timeline({ entries, onOpen, onNew }: { entries: DiaryEntry[]; onOpen: (id: string) => void; onNew: () => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const filtered = useMemo(() => entries.filter((entry) => {
    const query = search.toLowerCase();
    return (category === 'All' || entry.category === category) && (!query || `${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase().includes(query));
  }), [entries, search, category]);
  const grouped = useMemo(() => filtered.reduce<Record<string, DiaryEntry[]>>((acc, item) => {
    const key = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(item.date));
    (acc[key] ||= []).push(item);
    return acc;
  }, {}), [filtered]);

  return (
    <section className="mx-auto max-w-[1040px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="animate-rise-in mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-[#e36851]">Your workshop journal</p>
          <h1 className="serif text-[clamp(42px,7vw,74px)] leading-[.9] tracking-[-.03em] text-[#252a3a]">Remember<br /><em>the making.</em></h1>
          <p className="mt-5 max-w-[410px] text-[15px] leading-relaxed text-[#77716c]">A quiet place for the bugs, breakthroughs, and little proof that Dooli is becoming real.</p>
        </div>
        <button data-testid="button-add-first-entry" onClick={onNew} className="flex w-fit items-center gap-2 rounded-xl bg-[#e36851] px-5 py-3.5 text-sm font-bold text-[#fff8ec] shadow-[0_4px_0_#c55542] transition hover:-translate-y-0.5 hover:shadow-[0_6px_0_#c55542] active:translate-y-0"><Plus size={17} /> Capture a moment</button>
      </div>
      <div className="mb-9 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a938a]" />
          <input data-testid="input-search-entries" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your memories..." className="h-12 w-full rounded-xl border border-[#ddd4c7] bg-[#fbf8f1] pl-11 pr-4 text-sm text-[#323544] outline-none transition placeholder:text-[#aaa198] focus:border-[#e36851] focus:ring-2 focus:ring-[#e36851]/15" />
        </label>
        <div className="relative">
          <button data-testid="button-filter-entries" onClick={() => setFilterOpen(!filterOpen)} className="flex h-12 w-full items-center justify-between gap-6 rounded-xl border border-[#ddd4c7] bg-[#fbf8f1] px-4 text-sm text-[#625e5b] transition hover:border-[#c7bfb2] sm:w-auto"><span className="flex items-center gap-2"><Filter size={16} /> {category}</span><ChevronDown size={15} /></button>
          {filterOpen && <div className="animate-soft-pop absolute right-0 top-14 z-10 min-w-[150px] rounded-xl border border-[#ddd4c7] bg-[#fbf8f1] p-1.5 shadow-[0_12px_30px_rgba(60,45,30,.13)]">{['All', ...categories].map((item) => <button data-testid={`button-category-filter-${item}`} key={item} onClick={() => { setCategory(item as Category | 'All'); setFilterOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#625e5b] hover:bg-[#eee6d9]">{item}</button>)}</div>}
        </div>
      </div>
      {entries.length === 0 ? <EmptyState onNew={onNew} /> : filtered.length === 0 ? <NoResults onClear={() => { setSearch(''); setCategory('All'); }} /> : <div className="space-y-10">{Object.entries(grouped).map(([month, monthEntries]) => <div key={month}><div className="mb-4 flex items-center gap-3"><span className="mono text-[10px] uppercase tracking-[.18em] text-[#aaa197]">{month}</span><div className="h-px flex-1 bg-[#ded6ca]" /></div><div className="space-y-3">{monthEntries.map((entry, index) => <EntryCard key={entry.id} entry={entry} index={index} onOpen={() => onOpen(entry.id)} />)}</div></div>)}</div>}
    </section>
  );
}

function EntryCard({ entry, index, onOpen }: { entry: DiaryEntry; index: number; onOpen: () => void }) {
  return <button data-testid={`card-entry-${entry.id}`} onClick={onOpen} style={{ animationDelay: `${index * 70}ms` }} className="animate-rise-in group flex w-full items-start gap-4 rounded-2xl border border-[#e1d9cd] bg-[#fbf8f1] p-5 text-left shadow-[0_2px_0_rgba(60,45,30,.03)] transition duration-300 hover:-translate-y-1 hover:border-[#cfc3b4] hover:shadow-[0_13px_25px_rgba(60,45,30,.08)] sm:p-6">
    <div className="mt-1 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eee7dc] text-[#77716c]"><span className="mono text-[10px] uppercase">{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(entry.date))}</span><span className="serif text-lg leading-none">{new Date(entry.date).getDate()}</span></div>
    <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[.09em] ${categoryTone(entry.category)}`}>{entry.category}</span><span className="text-xs text-[#aaa198]">{formatDate(entry.date)}</span></div><h2 data-testid={`text-entry-title-${entry.id}`} className="mb-2 text-[17px] font-bold tracking-[-.015em] text-[#2f3241] transition group-hover:text-[#e36851]">{entry.title}</h2><p className="line-clamp-2 max-w-[690px] text-sm leading-relaxed text-[#77716c]">{entry.body}</p>{entry.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{entry.tags.map((tag) => <span key={tag} className="rounded-md bg-[#f0ebe3] px-2 py-1 text-[10px] text-[#827a71]">#{tag}</span>)}</div>}</div><ChevronRight className="mt-2 shrink-0 text-[#c0b6aa] transition group-hover:translate-x-1 group-hover:text-[#e36851]" size={19} /></button>;
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return <div data-testid="state-empty-entries" className="animate-soft-pop rounded-2xl border border-dashed border-[#d3c7b8] bg-[#eee7db]/65 px-6 py-16 text-center"><div className="mx-auto mb-5 flex h-14 w-14 rotate-[-5deg] items-center justify-center rounded-2xl bg-[#f8d9cb] text-[#e36851]"><Pencil size={23} /></div><h2 className="serif text-3xl text-[#2f3241]">Nothing here yet.</h2><p className="mx-auto mt-2 max-w-[340px] text-sm leading-relaxed text-[#827a72]">Your best stories start as a scrappy note. Capture the first one while it is still fresh.</p><button data-testid="button-empty-new-entry" onClick={onNew} className="mt-6 rounded-lg bg-[#29394c] px-4 py-2.5 text-sm font-semibold text-[#fff8ec] transition hover:bg-[#354c62]">Write the first note</button></div>;
}

function NoResults({ onClear }: { onClear: () => void }) {
  return <div data-testid="state-no-results" className="animate-soft-pop rounded-2xl border border-[#e1d9cd] bg-[#fbf8f1] px-6 py-16 text-center"><Search className="mx-auto mb-4 text-[#b2a79a]" size={28} /><h2 className="serif text-3xl text-[#2f3241]">No matching moments.</h2><p className="mt-2 text-sm text-[#827a72]">Try a different word or loosen the filter.</p><button data-testid="button-clear-search" onClick={onClear} className="mt-5 text-sm font-bold text-[#e36851] hover:underline">Clear search</button></div>;
}

function EntryEditor({ entry, onSave, onCancel }: { entry?: DiaryEntry; onSave: (entry: DiaryEntry) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [category, setCategory] = useState<Category>(entry?.category ?? 'Build');
  const [tags, setTags] = useState(entry?.tags.join(', ') ?? '');
  const [attachment, setAttachment] = useState(entry?.attachment);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim() && !body.trim()) { setError('Give this moment a title or a few words first.'); return; }
    onSave({ id: entry?.id ?? `entry-${Date.now()}`, title: title.trim() || 'Untitled moment', body: body.trim(), category, tags: tags.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean), date: entry?.date ?? new Date().toISOString(), attachment });
    setSaved(true);
  };

  const readAttachment = (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) { setError('Keep attachments under 2MB for local storage.'); return; }
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, data: typeof reader.result === 'string' ? reader.result : undefined });
    reader.readAsDataURL(file);
  };

  return <section className="mx-auto max-w-[840px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12"><button data-testid="button-cancel-entry" onClick={onCancel} className="mb-10 flex items-center gap-2 text-sm font-semibold text-[#77716c] transition hover:text-[#29394c]"><ArrowLeft size={16} /> Back to timeline</button><div className="animate-rise-in"><p className="mono mb-3 text-[10px] uppercase tracking-[.2em] text-[#e36851]">{entry ? 'Edit the moment' : 'New journal entry'}</p><h1 className="serif text-[clamp(42px,7vw,68px)] leading-[.9] text-[#252a3a]">{entry ? 'Keep shaping it.' : 'What happened today?'}</h1><p className="mt-4 text-sm text-[#827a72]">No need to make it sound impressive. Just make it true.</p></div><div className="mt-10 rounded-2xl border border-[#e1d9cd] bg-[#fbf8f1] p-5 shadow-[0_8px_28px_rgba(60,45,30,.06)] sm:p-8"><label className="mb-2 block mono text-[10px] uppercase tracking-[.16em] text-[#aaa198]">A short title</label><input data-testid="input-entry-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="The thing I almost missed..." className="mb-7 w-full border-b border-[#ddd4c7] bg-transparent pb-3 text-2xl font-bold tracking-[-.03em] text-[#2f3241] outline-none placeholder:text-[#c8c0b6] focus:border-[#e36851]" /><label className="mb-2 block mono text-[10px] uppercase tracking-[.16em] text-[#aaa198]">The unpolished version</label><textarea data-testid="input-entry-body" value={body} onChange={(event) => setBody(event.target.value)} rows={7} placeholder="What happened? What did you notice? Why might it matter?" className="mb-7 w-full resize-none rounded-xl border border-[#e2d9cd] bg-[#f7f2ea] p-4 text-[15px] leading-relaxed text-[#3f414d] outline-none transition placeholder:text-[#b9b0a5] focus:border-[#e36851] focus:ring-2 focus:ring-[#e36851]/10" /><div className="grid gap-6 sm:grid-cols-2"><div><label className="mb-2 block mono text-[10px] uppercase tracking-[.16em] text-[#aaa198]">What kind of moment?</label><div className="flex flex-wrap gap-2">{categories.map((item) => <button data-testid={`button-entry-category-${item}`} key={item} onClick={() => setCategory(item)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${category === item ? `${categoryTone(item)} border-transparent` : 'border-[#ded5c8] bg-[#f7f2ea] text-[#858078] hover:border-[#bdb2a4]'}`}>{item}</button>)}</div></div><div><label className="mb-2 block mono text-[10px] uppercase tracking-[.16em] text-[#aaa198]">Tags <span className="normal-case tracking-normal">(comma separated)</span></label><div className="relative"><Tag size={15} className="absolute left-3 top-3 text-[#aaa198]" /><input data-testid="input-entry-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="launch, tiny-win" className="w-full rounded-lg border border-[#ded5c8] bg-[#f7f2ea] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#e36851]" /></div></div></div><div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5ddd2] pt-6"><div className="flex items-center gap-3"><label data-testid="button-attach-file" className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#ded5c8] bg-[#f7f2ea] px-3 py-2 text-xs font-bold text-[#706b66] transition hover:border-[#bdb2a4]"><ImageIcon size={15} /> {attachment ? attachment.name : 'Attach a reference'}<input data-testid="input-entry-attachment" type="file" accept="image/*,.pdf,.txt" className="hidden" onChange={(event) => readAttachment(event.target.files?.[0])} /></label>{attachment && <button data-testid="button-remove-attachment" onClick={() => setAttachment(undefined)} className="text-xs text-[#a45b4e] hover:underline">Remove</button>}</div><div className="flex items-center gap-3">{error && <span data-testid="status-entry-error" className="text-xs font-semibold text-[#a45b4e]">{error}</span>}<button data-testid="button-save-entry" onClick={submit} className="flex items-center gap-2 rounded-lg bg-[#e36851] px-5 py-2.5 text-sm font-bold text-[#fff8ec] shadow-[0_3px_0_#c55542] transition hover:-translate-y-0.5 active:translate-y-0">{saved ? <Check size={16} /> : <Send size={15} />}{saved ? 'Saved' : 'Save moment'}</button></div></div></div></section>;
}

function EntryDetail({ entry, onBack, onEdit, onDelete }: { entry: DiaryEntry; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const [composer, setComposer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <section className="mx-auto max-w-[880px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12"><div className="mb-10 flex items-center justify-between"><button data-testid="button-back-timeline" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-[#77716c] transition hover:text-[#29394c]"><ArrowLeft size={16} /> Timeline</button><div className="flex items-center gap-1"><button data-testid="button-edit-entry" onClick={onEdit} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#77716c] hover:bg-[#e9e0d3]"><Pencil size={15} /> Edit</button>{confirmDelete ? <div className="animate-soft-pop flex items-center gap-2 rounded-lg bg-[#f4dfdf] px-2 py-1.5 text-xs text-[#983f4a]"><span>Delete this?</span><button data-testid="button-confirm-delete" onClick={onDelete} className="font-bold underline">Yes</button><button data-testid="button-cancel-delete" onClick={() => setConfirmDelete(false)} className="font-bold">No</button></div> : <button data-testid="button-delete-entry" onClick={() => setConfirmDelete(true)} className="rounded-lg p-2 text-[#aaa198] hover:bg-[#f4dfdf] hover:text-[#983f4a]" title="Delete entry"><Trash2 size={16} /></button>}</div></div><article className="animate-rise-in rounded-2xl border border-[#e1d9cd] bg-[#fbf8f1] p-6 shadow-[0_10px_32px_rgba(60,45,30,.06)] sm:p-10"><div className="mb-7 flex flex-wrap items-center gap-3"><span className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[.09em] ${categoryTone(entry.category)}`}>{entry.category}</span><span className="mono text-[10px] uppercase tracking-[.12em] text-[#aaa198]">{formatLongDate(entry.date)}</span></div><h1 data-testid={`text-detail-title-${entry.id}`} className="serif max-w-[700px] text-[clamp(40px,7vw,72px)] leading-[.93] tracking-[-.025em] text-[#252a3a]">{entry.title}</h1><div className="my-9 h-px bg-[#e5ddd2]" /><p data-testid={`text-detail-body-${entry.id}`} className="max-w-[690px] whitespace-pre-wrap text-[17px] leading-[1.8] text-[#4d4c52]">{entry.body}</p>{entry.attachment && <div className="mt-8 overflow-hidden rounded-xl border border-[#e1d9cd] bg-[#f1eadf]">{entry.attachment.data?.startsWith('data:image') ? <img data-testid={`img-attachment-${entry.id}`} src={entry.attachment.data} alt={entry.attachment.name} className="max-h-[420px] w-full object-contain" /> : <div className="flex items-center gap-3 p-4 text-sm text-[#706b66]"><FileText size={18} />{entry.attachment.name}</div>}</div>}<div className="mt-10 flex flex-wrap gap-2">{entry.tags.map((tag) => <span key={tag} className="rounded-md bg-[#f0ebe3] px-2.5 py-1.5 text-xs text-[#827a71]">#{tag}</span>)}</div></article><div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#ead9b5] bg-[#fbf2d8] p-5 sm:flex-row sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2d68d] text-[#886a1d]"><Sparkles size={18} /></div><div><h2 className="font-bold text-[#454032]">This feels like a story.</h2><p className="text-sm text-[#82765a]">Turn this raw note into something worth sharing.</p></div></div><button data-testid="button-open-composer" onClick={() => setComposer(true)} className="flex items-center gap-2 rounded-lg bg-[#29394c] px-4 py-2.5 text-sm font-bold text-[#fff8ec] transition hover:bg-[#354c62]">Open post composer <ArrowUpRight size={15} /></button></div>{composer && <Composer entry={entry} onClose={() => setComposer(false)} />}</section>;
}

function Composer({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const [channel, setChannel] = useState<Channel>('Twitter / X');
  const [copied, setCopied] = useState(false);
  const copyText = useMemo(() => {
    if (channel === 'Twitter / X') return `${entry.body}\n\nBuilding in public, one small moment at a time.`;
    if (channel === 'LinkedIn') return `A small moment from building Dooli:\n\n${entry.body}\n\nThe work rarely looks dramatic while you are in it. But this is the part worth remembering.`;
    return `Title: ${entry.title}\n\n${entry.body}\n\nCurious how other founders think about moments like this.`;
  }, [channel, entry]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(copyText); } catch { /* Clipboard may be unavailable in preview contexts. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <div className="animate-soft-pop fixed inset-0 z-50 flex items-end justify-center bg-[#202534]/35 p-0 sm:items-center sm:p-5"><div className="max-h-[92dvh] w-full max-w-[680px] overflow-auto rounded-t-2xl border border-[#ded4c6] bg-[#fbf8f1] shadow-[0_24px_70px_rgba(25,29,42,.25)] sm:rounded-2xl"><div className="flex items-start justify-between border-b border-[#e4dbcf] px-5 py-5 sm:px-7"><div><p className="mono mb-1 text-[10px] uppercase tracking-[.16em] text-[#e36851]">Share the signal</p><h2 className="serif text-3xl text-[#2f3241]">Make it sound like you.</h2></div><button data-testid="button-close-composer" onClick={onClose} className="rounded-lg p-2 text-[#9a938a] hover:bg-[#eee6d9]"><X size={19} /></button></div><div className="p-5 sm:p-7"><div className="mb-5 flex gap-2 rounded-xl bg-[#eee7dc] p-1">{(['Twitter / X', 'LinkedIn', 'Reddit'] as Channel[]).map((item) => <button data-testid={`button-channel-${item.replace(/[^a-z]/gi, '-').toLowerCase()}`} key={item} onClick={() => { setChannel(item); setCopied(false); }} className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-bold transition ${channel === item ? 'bg-[#fbf8f1] text-[#29394c] shadow-sm' : 'text-[#8d867d] hover:text-[#56545a]'}`}>{item}</button>)}</div><div className="rounded-xl border border-[#dfd6ca] bg-[#f6f0e7] p-5"><div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-[#6f6961]"><Sparkles size={14} className="text-[#e36851]" /> Draft for {channel}</span><span className="mono text-[10px] text-[#aaa198]">{copyText.length} chars</span></div><textarea data-testid="textarea-composer-copy" value={copyText} readOnly rows={9} className="w-full resize-none bg-transparent text-[15px] leading-[1.75] text-[#41414b] outline-none" /></div><div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center"><p className="flex items-center gap-1.5 text-xs text-[#93897d]"><Clipboard size={13} /> Copy it, then make it yours.</p><button data-testid="button-copy-post" onClick={copy} className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition ${copied ? 'bg-[#4f8063] text-white' : 'bg-[#e36851] text-[#fff8ec] shadow-[0_3px_0_#c55542] hover:-translate-y-0.5'}`}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? 'Copied to clipboard' : 'Copy post'}</button></div></div></div></div>;
}

function LoadingScreen() {
  return <div data-testid="state-loading" className="flex min-h-[100dvh] items-center justify-center bg-[#f5f0e7]"><div className="flex items-center gap-3 text-[#77716c]"><div className="h-3 w-3 animate-pulse rounded-full bg-[#e36851]" /><span className="serif text-2xl">opening your notebook...</span></div></div>;
}

function NotFound({ onBack }: { onBack: () => void }) {
  return <div className="py-28 text-center"><h1 className="serif text-5xl text-[#2f3241]">That page wandered off.</h1><button data-testid="button-not-found-back" onClick={onBack} className="mt-5 font-bold text-[#e36851] hover:underline">Back to timeline</button></div>;
}

export default App;