import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown, ChevronUp, Download, Gauge, Settings as Gear, Music2, Film, Trash2, Moon,
  Minus, Pause, Play, Scale, Search, Settings2, SlidersHorizontal, Maximize2, ArrowUpDown,
  SunMedium, Volume2, VolumeX, Wifi, BatteryFull, Power, Folder, Sparkles, X, FileText, Clipboard, Scissors
} from 'lucide-react'


type AppKind = 'external' | 'scope' | 'music' | 'settings' | 'explorer' | 'notes' | 'trash' | 'media' | 'store'
type AppItem = { name: string; kind: AppKind; url?: string; tone: 'yellow' | 'violet' | 'blue' | 'slate' }
type Position = { x: number; y: number }
type UserFile = { id:string; name:string; kind:'file'|'note'; location:string; mime?:string; data?:string; createdAt:number }
type UserFolder = { id:string; name:string; parent:string; createdAt:number }
type ExplorerFolder = string

const FILE_KEY = 'ida-files-v2'
const readFiles = (): UserFile[] => { try { const raw=localStorage.getItem(FILE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] } }
const saveFiles = (files: UserFile[]) => { try { localStorage.setItem(FILE_KEY, JSON.stringify(files)) } catch {} }

const appBaseId = (id:string) => id.split('::')[0]
const appForId = (id:string) => { const exact=APPS.find(a=>a.name===id); if(exact)return exact; const base=appBaseId(id); return APPS.find(a=>a.name===base) }

const APPS: AppItem[] = [
  { name: 'DAPP', kind: 'store', tone: 'violet' },
  { name: 'DaEconomy', kind: 'external', url: 'https://xt0tiedcmrq9i5amck0jexb0.macaly.app/', tone: 'yellow' },
  { name: 'DaCourt', kind: 'external', url: 'https://jquv9w2u2tbwtpi6qdd4ze7n.macaly.app/', tone: 'yellow' },
  { name: 'DaMusic', kind: 'music', tone: 'violet' },
  { name: 'DaScope', kind: 'scope', tone: 'blue' },
  { name: 'DaFile Explorer', kind: 'explorer', tone: 'blue' },
  { name: 'DaNotes', kind: 'notes', tone: 'slate' },
  { name: 'DaSettings', kind: 'settings', tone: 'slate' },
  { name: 'DaTrash', kind: 'trash', tone: 'violet' },
  { name: 'DaMedia', kind: 'media', tone: 'blue' },
]

const DEFAULT_POSITIONS: Record<string, Position> = {
  DAPP: { x: 3, y: 4 },
  DaEconomy: { x: 3, y: 13 },
  DaCourt: { x: 3, y: 22 },
  DaMusic: { x: 3, y: 31 },
  DaScope: { x: 3, y: 40 },
  'DaFile Explorer': { x: 3, y: 40 },
  DaSettings: { x: 3, y: 49 },
  DaTrash: { x: 3, y: 58 },
  DaNotes: { x: 3, y: 67 },
  DaMedia: { x: 3, y: 76 },
}

type DappCatalogItem = { name:string; tagline:string; description:string; category:string; tone:'yellow'|'violet'|'blue'|'slate'|'red'|'amber' }
const DAPP_CATALOG: DappCatalogItem[] = [
  {name:'DaEconomy',tagline:'The official bank of DaBoys',description:'The official bank of the DaBoys group. Work for money, play games, or trade. Buy items in the shop that can benefit you across DaBoys, manage your economy, and build your balance.',category:'Finance',tone:'yellow'},
  {name:'DaCourt',tagline:'Justice, trials, and roles',description:'The official courtroom for DaBoys. Become a judge, prosecutor, lawyer, or take part in cases, trials, and the growing legal world of DaBoys.',category:'Community',tone:'red'},
  {name:'DaMusic',tagline:'Your music, inside IDA',description:'A focused music player for IDA with playlists, playback controls, volume control, and a clean desktop experience.',category:'Entertainment',tone:'violet'},
  {name:'DaScope',tagline:'Search the web, the simple way',description:'DaScope is IDA’s lightweight web search app. Type what you are looking for and DaScope takes you straight to Google for the results, keeping the experience fast and familiar.',category:'Search',tone:'blue'},
  {name:'DaNotes',tagline:'Write it down. Keep it close.',description:'A simple notes workspace for ideas, plans, reminders, and anything else you want to keep inside IDA.',category:'Productivity',tone:'amber'},
]

const WALLPAPERS: Record<string, string> = {
  'Moonlit Dunes': 'https://images.pexels.com/photos/7025657/pexels-photo-7025657.jpeg?cs=srgb&dl=pexels-nasimgs-7025657.jpg&fm=jpg',
  'Mountain Lake': 'https://images.pexels.com/photos/18928472/pexels-photo-18928472.jpeg?cs=srgb&dl=pexels-bylukemiller-18928472.jpg&fm=jpg',
  'Desert Stars': 'https://images.pexels.com/photos/28737270/pexels-photo-28737270.jpeg?cs=srgb&dl=pexels-simon-steiner-1108932161-28737270.jpg&fm=jpg',
  'Moonlit Sea': 'https://images.pexels.com/photos/12490458/pexels-photo-12490458.jpeg?cs=srgb&dl=pexels-andrey-yudkin-63325015-12490458.jpg&fm=jpg',
  'Moonlit Coast': 'https://images.pexels.com/photos/8776172/pexels-photo-8776172.jpeg?cs=srgb&dl=pexels-alexmaksin55-8776172.jpg&fm=jpg',
  'Night Lake': 'https://images.pexels.com/photos/7348417/pexels-photo-7348417.jpeg?auto=compress&cs=tinysrgb&w=2400',
}

const UI_TRANSLATIONS: Record<'cs'|'vi'|'ar-YE', Record<string,string>> = {
  cs: {
    'Search':'Hledat','Search apps, settings, and more':'Hledat aplikace, nastavení a další','Welcome to IDA':'Vítejte v IDA','Your desktop apps':'Vaše aplikace na ploše','Pinned':'Připnuté','All apps':'Všechny aplikace','Quick access':'Rychlý přístup','Open an app from your desktop or taskbar':'Otevřete aplikaci z plochy nebo hlavního panelu','IDA OS':'IDA OS','Power':'Napájení','Shut down':'Vypnout','Close IDA':'Zavřít IDA','Sleep':'Spánek','Keep IDA open and resume later':'Ponechat IDA otevřenou a pokračovat později','Restart IDA':'Restartovat IDA','Restart the IDA desktop':'Restartovat plochu IDA','Cancel':'Zrušit','Open app':'Otevřít aplikaci','Close app':'Zavřít aplikaci','Remove from taskbar':'Odebrat z hlavního panelu','Refresh':'Obnovit','Rename':'Přejmenovat','Copy':'Kopírovat','Cut':'Vyjmout','Paste':'Vložit','Delete':'Smazat','Open':'Otevřít','Open File':'Otevřít soubor','New':'Nový','New File':'Nový soubor','New Folder':'Nová složka','New Note':'Nová poznámka','IDA settings':'Nastavení IDA','Settings':'Nastavení','Personalize your IDA desktop.':'Přizpůsobte si plochu IDA.','Wallpaper':'Tapeta','Wallpaper rotation':'Rotace tapet','Cycle the night wallpapers automatically.':'Automaticky střídat noční tapety.','Fade between wallpapers':'Plynulý přechod mezi tapetami','Use a soft crossfade when the wallpaper changes.':'Použít jemný přechod při změně tapety.','Include my wallpaper in rotation':'Zařadit moji tapetu do rotace','Your uploaded photo joins the 10-second wallpaper cycle.':'Nahraná fotografie se přidá do 10sekundové rotace tapet.','Upload custom wallpaper':'Nahrát vlastní tapetu','Desktop icon size':'Velikost ikon na ploše','Adjust the size of desktop apps.':'Upravte velikost aplikací na ploše.','Small':'Malé','Default':'Výchozí','Large':'Velké','Extra large':'Extra velké','NOW PLAYING':'PRÁVĚ HRAJE','Battery':'Baterie','Internet':'Internet','On':'Zapnuto','Off':'Vypnuto','Charging':'Nabíjení','Restarting IDA':'Restartování IDA','Don\'t turn off the web':'Nevypínejte web','Almost there...':'Už skoro hotovo...','Shutting down IDA':'Vypínání IDA','Closing IDA...':'Zavírání IDA...','IDA is sleeping':'IDA spí','Open IDA':'Otevřít IDA','Home':'Domů','Desktop':'Plocha','Photos':'Fotografie','Music':'Hudba','Videos':'Videa','Back':'Zpět','No notes yet':'Zatím žádné poznámky','Start writing...':'Začněte psát...','Control Center':'Centrum ovládání','Brightness':'Jas','Volume':'Hlasitost','Language':'Jazyk','Czech':'Čeština','Vietnamese':'Vietnamština','Yemeni Arabic':'Arabština (Jemen)','Restart to apply language change?':'Restartovat pro použití změny jazyka?','The new language will be applied after restart.':'Nový jazyk bude použit po restartu.','Restart':'Restartovat'
  },
  vi: {
    'Search':'Tìm kiếm','Search apps, settings, and more':'Tìm ứng dụng, cài đặt và hơn thế nữa','Welcome to IDA':'Chào mừng đến với IDA','Your desktop apps':'Các ứng dụng trên màn hình','Pinned':'Đã ghim','All apps':'Tất cả ứng dụng','Quick access':'Truy cập nhanh','Open an app from your desktop or taskbar':'Mở ứng dụng từ màn hình hoặc thanh tác vụ','Power':'Nguồn','Shut down':'Tắt máy','Close IDA':'Đóng IDA','Sleep':'Ngủ','Keep IDA open and resume later':'Giữ IDA mở và tiếp tục sau','Restart IDA':'Khởi động lại IDA','Restart the IDA desktop':'Khởi động lại màn hình IDA','Cancel':'Hủy','Open app':'Mở ứng dụng','Close app':'Đóng ứng dụng','Remove from taskbar':'Xóa khỏi thanh tác vụ','Refresh':'Làm mới','Rename':'Đổi tên','Copy':'Sao chép','Cut':'Cắt','Paste':'Dán','Delete':'Xóa','Open':'Mở','Open File':'Mở tệp','New':'Mới','New File':'Tệp mới','New Folder':'Thư mục mới','New Note':'Ghi chú mới','IDA settings':'Cài đặt IDA','Personalize your IDA desktop.':'Cá nhân hóa màn hình IDA.','Wallpaper':'Hình nền','Wallpaper rotation':'Xoay hình nền','Cycle the night wallpapers automatically.':'Tự động đổi hình nền ban đêm.','Fade between wallpapers':'Chuyển mờ giữa các hình nền','Use a soft crossfade when the wallpaper changes.':'Dùng hiệu ứng chuyển mờ khi hình nền thay đổi.','Include my wallpaper in rotation':'Đưa hình nền của tôi vào vòng xoay','Your uploaded photo joins the 10-second wallpaper cycle.':'Ảnh bạn tải lên sẽ tham gia chu kỳ hình nền 10 giây.','Upload custom wallpaper':'Tải hình nền tùy chỉnh','Desktop icon size':'Kích thước biểu tượng','Adjust the size of desktop apps.':'Điều chỉnh kích thước ứng dụng trên màn hình.','Small':'Nhỏ','Default':'Mặc định','Large':'Lớn','Extra large':'Rất lớn','NOW PLAYING':'ĐANG PHÁT','Battery':'Pin','Internet':'Internet','On':'Bật','Off':'Tắt','Charging':'Đang sạc','Restarting IDA':'Đang khởi động lại IDA','Don\'t turn off the web':'Đừng tắt trang web','Almost there...':'Sắp xong...','Shutting down IDA':'Đang tắt IDA','Closing IDA...':'Đang đóng IDA...','IDA is sleeping':'IDA đang ngủ','Open IDA':'Mở IDA','Home':'Trang chủ','Desktop':'Màn hình','Photos':'Ảnh','Music':'Nhạc','Videos':'Video','Back':'Quay lại','No notes yet':'Chưa có ghi chú','Start writing...':'Bắt đầu viết...','Control Center':'Trung tâm điều khiển','Brightness':'Độ sáng','Volume':'Âm lượng','Language':'Ngôn ngữ','Czech':'Tiếng Séc','Vietnamese':'Tiếng Việt','Yemeni Arabic':'Tiếng Ả Rập Yemen','Restart to apply language change?':'Khởi động lại để áp dụng thay đổi ngôn ngữ?','The new language will be applied after restart.':'Ngôn ngữ mới sẽ được áp dụng sau khi khởi động lại.','Restart':'Khởi động lại'
  },
  'ar-YE': {
    'Search':'بحث','Search apps, settings, and more':'البحث عن التطبيقات والإعدادات والمزيد','Welcome to IDA':'مرحباً بك في IDA','Your desktop apps':'تطبيقات سطح المكتب','Pinned':'مثبت','All apps':'كل التطبيقات','Quick access':'وصول سريع','Open an app from your desktop or taskbar':'افتح تطبيقاً من سطح المكتب أو شريط المهام','Power':'الطاقة','Shut down':'إيقاف التشغيل','Close IDA':'إغلاق IDA','Sleep':'السكون','Keep IDA open and resume later':'إبقاء IDA مفتوحاً والمتابعة لاحقاً','Restart IDA':'إعادة تشغيل IDA','Restart the IDA desktop':'إعادة تشغيل سطح مكتب IDA','Cancel':'إلغاء','Open app':'فتح التطبيق','Close app':'إغلاق التطبيق','Remove from taskbar':'إزالة من شريط المهام','Refresh':'تحديث','Rename':'إعادة تسمية','Copy':'نسخ','Cut':'قص','Paste':'لصق','Delete':'حذف','Open':'فتح','Open File':'فتح الملف','New':'جديد','New File':'ملف جديد','New Folder':'مجلد جديد','New Note':'ملاحظة جديدة','IDA settings':'إعدادات IDA','Personalize your IDA desktop.':'خصص سطح مكتب IDA.','Wallpaper':'الخلفية','Wallpaper rotation':'تدوير الخلفيات','Cycle the night wallpapers automatically.':'تبديل الخلفيات الليلية تلقائياً.','Fade between wallpapers':'تلاشي بين الخلفيات','Use a soft crossfade when the wallpaper changes.':'استخدم انتقالاً ناعماً عند تغيير الخلفية.','Include my wallpaper in rotation':'إضافة خلفيتي إلى التدوير','Your uploaded photo joins the 10-second wallpaper cycle.':'ستدخل الصورة التي رفعتها في دورة خلفيات مدتها 10 ثوانٍ.','Upload custom wallpaper':'رفع خلفية مخصصة','Desktop icon size':'حجم أيقونات سطح المكتب','Adjust the size of desktop apps.':'اضبط حجم تطبيقات سطح المكتب.','Small':'صغير','Default':'افتراضي','Large':'كبير','Extra large':'كبير جداً','NOW PLAYING':'يعمل الآن','Battery':'البطارية','Internet':'الإنترنت','On':'تشغيل','Off':'إيقاف','Charging':'جارٍ الشحن','Restarting IDA':'إعادة تشغيل IDA','Don\'t turn off the web':'لا تغلق الويب','Almost there...':'اقتربنا...','Shutting down IDA':'إيقاف IDA','Closing IDA...':'إغلاق IDA...','IDA is sleeping':'IDA في وضع السكون','Open IDA':'فتح IDA','Home':'الرئيسية','Desktop':'سطح المكتب','Photos':'الصور','Music':'الموسيقى','Videos':'الفيديوهات','Back':'رجوع','No notes yet':'لا توجد ملاحظات بعد','Start writing...':'ابدأ الكتابة...','Control Center':'مركز التحكم','Brightness':'السطوع','Volume':'مستوى الصوت','Language':'اللغة','Czech':'التشيكية','Vietnamese':'الفيتنامية','Yemeni Arabic':'العربية (اليمن)','Restart to apply language change?':'أعد التشغيل لتطبيق تغيير اللغة؟','The new language will be applied after restart.':'سيتم تطبيق اللغة الجديدة بعد إعادة التشغيل.','Restart':'إعادة التشغيل'
  }
}

const TRACKS = [
  { title: 'SoundHelix Song 1', artist: 'SoundHelix', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'SoundHelix Song 2', artist: 'SoundHelix', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'SoundHelix Song 8', artist: 'SoundHelix', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
]

export function DaApps() {
  const [mounted, setMounted] = useState(false)
  const [positions, setPositions] = useState(DEFAULT_POSITIONS)
  const [wallpaper, setWallpaper] = useState(WALLPAPERS['Moonlit Dunes'])
  const [previousWallpaper, setPreviousWallpaper] = useState<string | null>(null)
  const [wallpaperRotation, setWallpaperRotation] = useState(true)
  const [wallpaperFade, setWallpaperFade] = useState(true)
  const [includeOwnWallpaper, setIncludeOwnWallpaper] = useState(true)
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [selectedDesktopItem, setSelectedDesktopItem] = useState<{type:'file'|'folder';id:string}|null>(null)
  const [selectedDesktopIds, setSelectedDesktopIds] = useState<string[]>([])
  const [selectedDesktopApps, setSelectedDesktopApps] = useState<string[]>([])
  const [desktopMarquee, setDesktopMarquee] = useState<{x:number;y:number;w:number;h:number;button:0|2}|null>(null)
  const desktopMarqueeRef = useRef<{sx:number;sy:number;button:0|2;dragged:boolean;active:boolean}>({sx:0,sy:0,button:0,dragged:false,active:false})
  const [files, setFiles] = useState<UserFile[]>([])
  const [folders, setFolders] = useState<UserFolder[]>([])
  const [folderApps, setFolderApps] = useState<Record<string,string[]>>({})
  const [desktopApps, setDesktopApps] = useState<string[]>(['DAPP','DaEconomy','DaCourt','DaMusic','DaFile Explorer','DaSettings','DaTrash'])
  const [clipboard, setClipboard] = useState<{type:'app'|'file'|'folder';id:string;mode:'copy'|'cut'}|null>(null)
  const [trash, setTrash] = useState<Array<{type:'app'|'file'|'folder';id:string;name:string;app?:AppItem;file?:UserFile;folder?:UserFolder;deletedAt:number}>>([])
  const [appLabels, setAppLabels] = useState<Record<string,string>>({})
  const [renaming, setRenaming] = useState<{type:'app'|'file'|'folder';id:string;name:string}|null>(null)
  const [explorerFolder, setExplorerFolder] = useState<ExplorerFolder>('Home')
  const [notes, setNotes] = useState<Record<string,string>>({})
  const [controlOpen, setControlOpen] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [internetOn, setInternetOn] = useState(true)
  useEffect(()=>{try{const saved=localStorage.getItem('ida-internet-on');if(saved!==null)setInternetOn(saved==='1')}catch{}},[])
  const setInternetState = (next:boolean) => { setInternetOn(next); try{localStorage.setItem('ida-internet-on',next?'1':'0')}catch{} }
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [batteryCharging, setBatteryCharging] = useState(false)
  const [volume, setVolume] = useState(70)
  const [desktop, setDesktop] = useState(false)
  const [taskbarApps, setTaskbarApps] = useState<string[]>(['DaEconomy','DaCourt','DaMusic','DaSettings'])
  const [taskbarTheme, setTaskbarTheme] = useState<'default'|'aurora'|'sunset'|'ocean'|'manual'>('default')
  const [taskbarManualColor, setTaskbarManualColor] = useState('#151b2a')
  const [contextMenu, setContextMenu] = useState<{x:number;y:number;scope:'desktop'|'explorer'|'window';app?:AppItem;file?:UserFile;folderItem?:UserFolder;folder?:ExplorerFolder;windowKey?:string}|null>(null)
  const [filePositions, setFilePositions] = useState<Record<string, Position>>({})
  const [explorerPositions, setExplorerPositions] = useState<Record<string, number>>({})
  const [explorerOpenFileId, setExplorerOpenFileId] = useState<string|null>(null)
  const [taskbarMenu, setTaskbarMenu] = useState<{x:number;y:number;name:string;key?:string;running?:boolean}|null>(null)
  const [taskbarPreview, setTaskbarPreview] = useState<string | null>(null)
  const taskbarHoverTimer = useRef<number | null>(null)
  const [startOpen, setStartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [windows, setWindows] = useState<Record<string, any>>({})
  const [activeWindow, setActiveWindow] = useState<string|null>(null)
  const [windowsHydrated, setWindowsHydrated] = useState(false)
  const [iconScale, setIconScale] = useState(1)
  const [clock, setClock] = useState(new Date())
  const [powerMenu, setPowerMenu] = useState(false)
  const [sleeping, setSleeping] = useState(false)
  const [shutdown, setShutdown] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [language, setLanguage] = useState<'en'|'cs'|'vi'|'ar-YE'>('en')
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [languagePrompt, setLanguagePrompt] = useState<'en'|'cs'|'vi'|'ar-YE'|null>(null)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(min-width: 701px) and (pointer: fine)')
    const syncDesktop = () => setDesktop(mq.matches)
    syncDesktop(); mq.addEventListener?.('change', syncDesktop)
    const tick = window.setInterval(() => setClock(new Date()), 1000)
    try {
      const savedPositions = localStorage.getItem('daapps-positions')
      const savedLanguage = localStorage.getItem('ida-language') as 'en'|'cs'|'vi'|'ar-YE'|null
      if (savedLanguage && ['en','cs','vi','ar-YE'].includes(savedLanguage)) setLanguage(savedLanguage)
      const savedWallpaper = localStorage.getItem('daapps-wallpaper')
      const savedCustom = localStorage.getItem('daapps-custom-wallpaper')
      const savedRotation = localStorage.getItem('ida-wallpaper-rotation-v2')
      const savedFade = localStorage.getItem('ida-wallpaper-fade')
      const savedOwn = localStorage.getItem('ida-wallpaper-own')
      if (savedRotation !== null) setWallpaperRotation(savedRotation === '1')
      if (savedFade !== null) setWallpaperFade(savedFade === '1')
      if (savedOwn !== null) setIncludeOwnWallpaper(savedOwn === '1')
      if (savedPositions) { const saved=JSON.parse(savedPositions); setPositions({ ...DEFAULT_POSITIONS, ...saved }) }
      const savedFilePositions = localStorage.getItem('ida-file-positions')
      if (savedFilePositions) setFilePositions(JSON.parse(savedFilePositions))
      const savedExplorerPositions = localStorage.getItem('ida-explorer-y'); if (savedExplorerPositions) setExplorerPositions(JSON.parse(savedExplorerPositions))
      if (savedCustom) {
        setCustomWallpaper(savedCustom)
        if (savedOwn !== '0') setWallpaper(savedCustom)
        else if (savedWallpaper && WALLPAPERS[savedWallpaper]) setWallpaper(WALLPAPERS[savedWallpaper])
        else setWallpaper(WALLPAPERS[Object.keys(WALLPAPERS)[0]])
      } else if (savedWallpaper && WALLPAPERS[savedWallpaper]) setWallpaper(WALLPAPERS[savedWallpaper])
      const savedTaskbar = localStorage.getItem('ida-taskbar'); if (savedTaskbar) setTaskbarApps(JSON.parse(savedTaskbar))
      const savedTaskbarTheme = localStorage.getItem('ida-taskbar-theme') as 'default'|'aurora'|'sunset'|'ocean'|'manual'|null
      const savedTaskbarColor = localStorage.getItem('ida-taskbar-manual-color')
      if (savedTaskbarTheme && ['default','aurora','sunset','ocean','manual'].includes(savedTaskbarTheme)) setTaskbarTheme(savedTaskbarTheme)
      if (savedTaskbarColor) setTaskbarManualColor(savedTaskbarColor)
      const savedScale = localStorage.getItem('ida-icon-scale'); if (savedScale) setIconScale(Number(savedScale))
      setFiles(readFiles())
      const savedFolders = localStorage.getItem('ida-folders-v1'); if(savedFolders) setFolders(JSON.parse(savedFolders))
      const savedFolderApps = localStorage.getItem('ida-folder-apps-v1'); if(savedFolderApps) setFolderApps(JSON.parse(savedFolderApps))
      const savedDesktopApps = localStorage.getItem('ida-desktop-apps'); if (savedDesktopApps) { const raw=Array.isArray(JSON.parse(savedDesktopApps))?JSON.parse(savedDesktopApps):[]; const normalized=raw.map((id:string)=>typeof id==='string'?id:'').filter(Boolean); setDesktopApps(Array.from(new Set(['DAPP',...normalized,'DaTrash']))) }
      const savedLabels = localStorage.getItem('ida-app-labels'); if (savedLabels) setAppLabels(JSON.parse(savedLabels))
      const savedNotes = localStorage.getItem('ida-notes-v2'); if (savedNotes) setNotes(JSON.parse(savedNotes))
      const savedTrash = localStorage.getItem('ida-trash-v1'); if (savedTrash) setTrash(JSON.parse(savedTrash))
      const savedWindows = localStorage.getItem('ida-open-windows-v1')
      const savedActiveWindow = localStorage.getItem('ida-active-window-v1')
      if (savedWindows) {
        const restored = JSON.parse(savedWindows)
        setWindows(restored && typeof restored === 'object' ? restored : {})
        if (savedActiveWindow && restored?.[savedActiveWindow]) setActiveWindow(savedActiveWindow)
      }
    } catch {} finally {
      setWindowsHydrated(true)
    }
    return () => { mq.removeEventListener?.('change', syncDesktop); window.clearInterval(tick) }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'cs' ? 'cs' : language === 'vi' ? 'vi' : language === 'ar-YE' ? 'ar-YE' : 'en'
    document.documentElement.dir = language === 'ar-YE' ? 'rtl' : 'ltr'
    if (language === 'en') return
    const map = UI_TRANSLATIONS[language]
    const originals = new WeakMap<Text,string>()
    const translate = (root:Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node:Node|null
      while ((node = walker.nextNode())) {
        const textNode = node as Text
        const parent = textNode.parentElement
        if (!parent || ['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)) continue
        const raw = originals.get(textNode) ?? textNode.nodeValue ?? ''
        if (!raw.trim()) { if (!originals.has(textNode)) originals.set(textNode, raw); continue }
        if (!originals.has(textNode)) originals.set(textNode, raw)
        const clean = raw.trim()
        const translated = map[clean]
        if (translated && textNode.nodeValue !== raw.replace(clean, translated)) {
          textNode.nodeValue = raw.replace(clean, translated)
        }
      }
      document.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]').forEach(el => {
        ;(['placeholder','title','aria-label'] as const).forEach(attr => {
          const raw = el.getAttribute(attr)
          if (raw && map[raw]) el.setAttribute(attr, map[raw])
        })
      })
    }
    translate(document.body)
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(n => translate(n))
      }
    })
    observer.observe(document.body,{subtree:true,childList:true})
    return () => observer.disconnect()
  }, [language])

  useEffect(() => {
    const batteryApi = (navigator as Navigator & { getBattery?: () => Promise<any> }).getBattery
    if (!batteryApi) return
    let battery: any
    const updateBattery = () => {
      if (!battery) return
      setBatteryLevel(Math.round(battery.level * 100))
      setBatteryCharging(!!battery.charging)
    }
    batteryApi().then((b:any) => {
      battery = b
      updateBattery()
      b.addEventListener('levelchange', updateBattery)
      b.addEventListener('chargingchange', updateBattery)
    }).catch(() => {})
    return () => {
      battery?.removeEventListener?.('levelchange', updateBattery)
      battery?.removeEventListener?.('chargingchange', updateBattery)
    }
  }, [])

  useEffect(() => {
    if (!windowsHydrated) return
    try {
      localStorage.setItem('ida-open-windows-v1', JSON.stringify(windows))
      if (activeWindow) localStorage.setItem('ida-active-window-v1', activeWindow)
      else localStorage.removeItem('ida-active-window-v1')
    } catch {}
  }, [windows, activeWindow, windowsHydrated])

  const savePositions = (next: Record<string, Position>) => {
    setPositions(next)
    try { localStorage.setItem('daapps-positions', JSON.stringify(next)) } catch {}
  }
  const saveFilePositions = (next: Record<string, Position>) => {
    setFilePositions(next)
    try { localStorage.setItem('ida-file-positions', JSON.stringify(next)) } catch {}
  }
  const saveExplorerPositions = (next: Record<string, number>) => {
    setExplorerPositions(next)
    try { localStorage.setItem('ida-explorer-y', JSON.stringify(next)) } catch {}
  }

  const saveTaskbar = (next: string[]) => { setTaskbarApps(next); try { localStorage.setItem('ida-taskbar', JSON.stringify(next)) } catch {} }
  const saveDesktopApps = (next:string[]) => { setDesktopApps(next); try { localStorage.setItem('ida-desktop-apps', JSON.stringify(next)) } catch {} }
  const isDappInstalled = (name:string) => desktopApps.some(x=>x.split('::')[0]===name) || Object.values(folderApps).some(items=>items.some(x=>x.split('::')[0]===name))
  const uninstallDapp = (name:string) => {
    if(name==='DaSettings' || name==='DaTrash' || name==='DaMedia' || name==='DAPP') return
    saveDesktopApps(desktopApps.filter(x=>x.split('::')[0]!==name))
    const cleaned=Object.fromEntries(Object.entries(folderApps).map(([k,items])=>[k,items.filter(x=>x.split('::')[0]!==name)]))
    commitFolderApps(cleaned)
    saveTrash(trash.filter(t=>!(t.type==='app'&&t.id.split('::')[0]===name)))
    saveTaskbar(taskbarApps.filter(x=>x.split('::')[0]!==name))
    Object.keys(windows).filter(k=>k===name||k.startsWith(name+':')||windows[k]?.appName===name).forEach(closeWindow)
  }
  const commitFiles = (next:UserFile[]) => { setFiles(next); saveFiles(next) }
  const commitFolders = (next:UserFolder[]) => { setFolders(next); try { localStorage.setItem('ida-folders-v1', JSON.stringify(next)) } catch {} }
  const commitFolderApps = (next:Record<string,string[]>) => { setFolderApps(next); try { localStorage.setItem('ida-folder-apps-v1', JSON.stringify(next)) } catch {}}
  const updateNotes = (next:Record<string,string>) => { setNotes(next); try { localStorage.setItem('ida-notes-v2', JSON.stringify(next)) } catch {} }
  const saveTrash = (next:typeof trash) => { setTrash(next); try { localStorage.setItem('ida-trash-v1', JSON.stringify(next)) } catch {} }
  const deleteToTrash = (type:'app'|'file'|'folder', id:string) => {
    // IDA-supported apps are still ordinary desktop/file-system shortcuts.
    // Only DaSettings is protected; DaFile Explorer, DaMedia, DaNotes, etc. can have their shortcuts deleted.
    if(type==='app' && appBaseId(id)==='DaSettings') return
    if(type==='app' && !desktopApps.includes(id) && !Object.values(folderApps).some(items=>items.includes(id))) return
    if(type==='app'){ const app=appForId(id); if(!app)return; saveTrash([...trash,{type:'app',id,name:appLabels[id]||app.name,app,deletedAt:Date.now()}]); saveDesktopApps(desktopApps.filter(n=>n!==id)); commitFolderApps(Object.fromEntries(Object.entries(folderApps).map(([k,items])=>[k,items.filter(n=>n!==id)]))); Object.keys(windows).filter(k=>k===id||windows[k]?.appInstanceId===id).forEach(closeWindow) }
    else if(type==='folder'){ const folder=folders.find(f=>f.id===id); if(!folder)return; saveTrash([...trash,{type:'folder',id,name:folder.name,folder,deletedAt:Date.now()}]); commitFolders(folders.filter(f=>f.id!==id)); commitFolderApps(Object.fromEntries(Object.entries(folderApps).filter(([k])=>k!==id))); closeWindow(id) }
    else { const file=files.find(f=>f.id===id); if(!file)return; saveTrash([...trash,{type:'file',id,name:file.name,file,deletedAt:Date.now()}]); commitFiles(files.filter(f=>f.id!==id)); const nextNotes={...notes}; delete nextNotes[id]; updateNotes(nextNotes); closeWindow(id) }
  }
  const restoreFromTrash = (item:typeof trash[number]) => { if(item.type==='app'&&item.id!=='DaTrash'&&item.app){const exists=desktopApps.includes(item.id); if(!exists)saveDesktopApps([...desktopApps,item.id])} if(item.type==='file'&&item.file)commitFiles([...files,item.file]); if(item.type==='folder'&&item.folder)commitFolders([...folders,item.folder]); saveTrash(trash.filter(t=>!(t.type===item.type&&t.id===item.id))) }
  const emptyTrash = () => {
    const permanentlyDeletedApps = new Set(trash.filter(item=>item.type==='app' && item.id!=='DaTrash' && item.id!=='DaSettings').map(item=>item.id))
    if (permanentlyDeletedApps.size) saveTaskbar(taskbarApps.filter(name=>!permanentlyDeletedApps.has(name)))
    saveTrash(trash.filter(item=>item.type==='app' && (item.id==='DaSettings'||item.id==='DaTrash')))
  }
  const canPlaceDesktopTile = (type:'app'|'file'|'folder', id:string, pos:Position) => {
    const area = document.querySelector('.home-screen')?.getBoundingClientRect()
    if (!area) return true
    const size = 92 * iconScale
    const gap = 5
    const x = pos.x / 100 * area.width
    const y = pos.y / 100 * area.height
    const overlaps = (other:Position) => {
      const ox = other.x / 100 * area.width
      const oy = other.y / 100 * area.height
      return x < ox + size - gap && x + size - gap > ox && y < oy + size - gap && y + size - gap > oy
    }
    for (const appName of desktopApps) if (type!=='app' || appName!==id) if (overlaps(positions[appName] || DEFAULT_POSITIONS[appName])) return false
    for (const folder of folders.filter(f=>f.parent==='Desktop')) if (!(type==='folder' && folder.id===id)) {
      const index = folders.filter(f=>f.parent==='Desktop').findIndex(f=>f.id===folder.id)
      const other = filePositions[folder.id] || {x:5+(index%5)*15,y:34+Math.floor(index/5)*14}
      if (overlaps(other)) return false
    }
    for (const file of files.filter(f=>f.location==='Desktop')) if (!(type==='file' && file.id===id)) {
      const index = files.filter(f=>f.location==='Desktop').findIndex(f=>f.id===file.id)
      const other = filePositions[file.id] || {x:5+(index%5)*15,y:34+Math.floor(index/5)*14}
      if (overlaps(other)) return false
    }
    return true
  }
  const moveDesktopItem = (type:'app'|'file'|'folder', id:string, pos:Position) => {
    if (!canPlaceDesktopTile(type,id,pos)) return
    if (type==='app') savePositions({...positions,[id]:pos})
    else saveFilePositions({...filePositions,[id]:pos})
  }
  const pasteClipboard = (location:ExplorerFolder='Desktop') => {
    if(!clipboard) return
    const target = location==='Home' ? 'Desktop' : location
    if(clipboard.type==='folder'){
      const source=folders.find(f=>f.id===clipboard.id)
      if(source){
        if(clipboard.mode==='cut') commitFolders(folders.map(f=>f.id===source.id?{...f,parent:target}:f))
        else { const id='folder-'+Date.now()+'-'+Math.random().toString(36).slice(2,7); commitFolders([...folders,{...source,id,parent:target}]); const appsIn=folderApps[source.id]||[]; if(appsIn.length) commitFolderApps({...folderApps,[id]:[...appsIn]}) }
      }
    } else if(clipboard.type==='app'){
      if(clipboard.mode==='cut'){
        const cleaned=Object.fromEntries(Object.entries(folderApps).map(([k,items])=>[k,items.filter(n=>n!==clipboard.id)]))
        if(target==='Desktop'){ commitFolderApps(cleaned); if(!desktopApps.includes(clipboard.id)) saveDesktopApps([...desktopApps,clipboard.id]) }
        else { commitFolderApps({...cleaned,[target]:[...new Set([...(cleaned[target]||[]),clipboard.id])]}); saveDesktopApps(desktopApps.filter(n=>n!==clipboard.id)) }
      } else if(target==='Desktop'){ const copyId=clipboard.id+'::copy-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5); saveDesktopApps([...desktopApps,copyId]) }
      else { const current=folderApps[target]||[]; const copyId=clipboard.id+'::copy-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5); commitFolderApps({...folderApps,[target]:[...current,copyId]}) }
    } else {
      const source=files.find(f=>f.id===clipboard.id)
      if(source){
        if(clipboard.mode==='cut') commitFiles(files.map(f=>f.id===source.id?{...f,location:target}:f))
        else commitFiles([...files,{...source,id:'file-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),location:target}])
      }
    }
    if(clipboard.mode==='cut') setClipboard(null)
  }
  const addNewFile = (location:string='Desktop') => { const id=`folder-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; const nextPos = (()=>{ if(location!=='Desktop') return {x:5,y:34}; for(let row=0;row<5;row++){ for(let col=0;col<6;col++){ const p={x:5+col*15,y:34+row*14}; if(canPlaceDesktopTile('folder',id,p)) return p } } return {x:5,y:80} })(); commitFolders([...folders,{id,name:'New File',parent:location,createdAt:Date.now()}]); commitFolderApps({...folderApps,[id]:folderApps[id]||[]}); saveFilePositions({...filePositions,[id]:nextPos}); return id }
  const addNewFolder = (parent:string='Desktop') => { const id=`folder-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; commitFolders([...folders,{id,name:'New Folder',parent,createdAt:Date.now()}]); return id }
  const addNote = (location:string='Desktop') => { const id=`note-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; const next:UserFile[]=[...files,{id,name:'New Note',kind:'note' as const,location,createdAt:Date.now()}]; commitFiles(next); updateNotes({...notes,[id]:''}); setExplorerFolder(location==='Desktop'?'Desktop':location as ExplorerFolder); return id }
  const importFiles = (list:FileList|null, location:'Desktop'|'Pictures'|'Music'|'Videos') => { if(!list?.length)return; const base=files.slice(); let remaining=list.length; Array.from(list).forEach(file=>{const id=`file-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;const reader=new FileReader();reader.onload=()=>{base.push({id,name:file.name,kind:'file',location,mime:file.type,data:String(reader.result),createdAt:Date.now()});remaining--;if(remaining===0)commitFiles(base)};reader.readAsDataURL(file)}) }
  const updateFileData = (id:string,data:string) => commitFiles(files.map(f=>f.id===id?{...f,data}:f))
  const deleteNote = (id:string) => { const nextFiles=files.filter(f=>f.id!==id); commitFiles(nextFiles); const nextNotes={...notes}; delete nextNotes[id]; updateNotes(nextNotes); setExplorerFolder('Notes') }
  const playVolumeTest = (level:number) => { try { const AudioCtx=window.AudioContext||(window as any).webkitAudioContext; if(!AudioCtx)return; const ctx=new AudioCtx(); const master=ctx.createGain(); const now=ctx.currentTime; master.gain.setValueAtTime(0.0001,now); master.gain.exponentialRampToValueAtTime(Math.max(0.006,Math.min(1,level/100)*0.035),now+0.018); master.gain.exponentialRampToValueAtTime(0.0001,now+0.26); master.connect(ctx.destination); const o1=ctx.createOscillator(); const o2=ctx.createOscillator(); o1.type='sine'; o2.type='sine'; o1.frequency.setValueAtTime(660,now); o1.frequency.exponentialRampToValueAtTime(880,now+0.19); o2.frequency.setValueAtTime(990,now); o2.frequency.exponentialRampToValueAtTime(1320,now+0.19); o1.connect(master); o2.connect(master); o1.start(now); o2.start(now); o1.stop(now+0.21); o2.stop(now+0.21); window.setTimeout(()=>ctx.close(),340) } catch {} }
  const renameItem = (type:'app'|'file'|'folder', id:string, name:string) => { const clean=name.trim(); if(!clean){setRenaming(null);return} if(type==='folder')commitFolders(folders.map(f=>f.id===id?{...f,name:clean}:f)); else if(type==='file')commitFiles(files.map(f=>f.id===id?{...f,name:clean}:f)); else { const next={...appLabels,[id]:clean}; setAppLabels(next); try{localStorage.setItem('ida-app-labels',JSON.stringify(next))}catch{} } setRenaming(null) }
  const copyDraggedAppToDesktop = (id:string) => { if (!APPS.some(a=>a.name===id)) return; const copyId=id+'::copy-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5); saveDesktopApps([...desktopApps,copyId]) }
  const moveDraggedItem = (type:'app'|'file'|'folder', id:string, target:string) => {
    if (type==='app') {
      // Move the exact shortcut ID, not its base app ID. This keeps copies independent.
      const cleaned=Object.fromEntries(Object.entries(folderApps).map(([k,items])=>[k,items.filter(n=>n!==id)]))
      if (target==='Desktop') {
        if (!desktopApps.includes(id)) saveDesktopApps([...desktopApps,id])
        commitFolderApps(cleaned)
      } else if (files.some(f=>f.id===target) || folders.some(f=>f.id===target)) {
        const existing=cleaned[target]||[]
        commitFolderApps({...cleaned,[target]:[...new Set([...existing,id])]})
        saveDesktopApps(desktopApps.filter(entry=>entry!==id))
      }
      return
    }
    if (type==='file') { if(target!=='Home' && target!==id) commitFiles(files.map(f=>f.id===id?{...f,location:target}:f)); return }
    if (id===target) return
    const targetFolder=folders.find(f=>f.id===target)
    if (target==='Desktop') commitFolders(folders.map(f=>f.id===id?{...f,parent:'Desktop'}:f))
    else if (targetFolder) commitFolders(folders.map(f=>f.id===id?{...f,parent:target}:f))
  }
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const target=e.target as HTMLElement|null
      if(target?.tagName==='INPUT'||target?.tagName==='TEXTAREA'||target?.isContentEditable) return
      const selected=selectedApp?{type:'app' as const,id:selectedApp}:selectedDesktopItem?selectedDesktopItem:null
      if(e.key.toLowerCase()==='v'&&clipboard){e.preventDefault();pasteClipboard('Desktop');return}
      if(!selected) return
      if(e.key.toLowerCase()==='c'){e.preventDefault();setClipboard({type:selected.type,id:selected.id,mode:'copy'})}
      if(e.key.toLowerCase()==='x'){e.preventDefault();setClipboard({type:selected.type,id:selected.id,mode:'cut'})}
      if(e.key.toLowerCase()==='v'&&clipboard){e.preventDefault();pasteClipboard('Desktop')}
    }
    window.addEventListener('keydown',onKeyDown)
    return ()=>window.removeEventListener('keydown',onKeyDown)
  },[selectedApp,selectedDesktopItem,clipboard])
  const openExplorerFolder = (folderId:string) => {
    const folder=folders.find(f=>f.id===folderId); if(!folder)return
    const k=`DaFile:${folderId}:${Date.now()}`
    setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:{kind:'explorer',appName:'DaFile Explorer',folderId,minimized:false,maximized:false,x:35+(Object.keys(prev).length%5)*18,y:30+(Object.keys(prev).length%4)*16,width:Math.min(window.innerWidth-40,1050),height:Math.min(window.innerHeight-90,700),z:maxZ+1,taskbarInstance:false}}})
    setActiveWindow(k)
  }
  const openUserFile = (file:UserFile) => {
    if(file.kind==='note'){const k=`DaNotes:${file.id}:${Date.now()}`;setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:{kind:'notes',appName:'DaNotes',fileId:file.id,minimized:false,maximized:false,x:80,y:50,width:Math.min(window.innerWidth-40,900),height:Math.min(window.innerHeight-90,650),z:maxZ+1,taskbarInstance:false}}});setActiveWindow(k);return}
    if(file.mime?.startsWith('image/')||file.mime?.startsWith('video/')){const k=`DaMedia:${file.id}:${Date.now()}`;setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:{kind:'media',appName:'DaMedia',fileId:file.id,minimized:false,maximized:false,x:80+(Object.keys(prev).length%4)*18,y:50+(Object.keys(prev).length%3)*16,width:Math.min(window.innerWidth-40,1000),height:Math.min(window.innerHeight-90,680),z:maxZ+1,taskbarInstance:false}}});setActiveWindow(k);return}
    if(folderApps[file.id]) { setExplorerFolder(file.id); setExplorerOpenFileId(null) } else { setExplorerFolder(file.location); setExplorerOpenFileId(file.id) }
    const explorer=APPS.find(a=>a.name==='DaFile Explorer'); if(explorer)openApp(explorer)
  }
  const openWebAppInstance = (app: AppItem, allowMultiple=false) => {
    const appId=app.name; const baseApp=appForId(appId); if(!baseApp||baseApp.kind!=='external'||!baseApp.url) return
    app={...baseApp,name:appId}
    if(app.kind!=='external'||!app.url) return
    if(!allowMultiple){
      const existing=Object.entries(windows).filter(([k,w])=>k===app.name||(w?.taskbarInstance===true&&w?.appName===app.name)).sort((a,b)=>(b[1]?.z||0)-(a[1]?.z||0))[0]
      if(existing){ focusWindow(existing[0]); return }
    }
    const k=(allowMultiple?'desktop:':'taskbar:')+app.name+':'+Date.now()
    const instanceUrl=app.url+(app.url.includes('?')?'&':'?')+'idaInstance='+encodeURIComponent(k)
    setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:{kind:'external',appName:app.name,minimized:false,maximized:false,x:35+(Object.keys(prev).length%4)*24,y:30+(Object.keys(prev).length%3)*20,width:Math.min(window.innerWidth-40,1050),height:Math.min(window.innerHeight-90,700),z:maxZ+1,externalUrl:instanceUrl,taskbarInstance:!allowMultiple,appInstanceId:appId}}})
    setActiveWindow(k)
  }
  const openApp = (app: AppItem, desktopInstance=false) => {
    const requestedId=app.name; const baseApp=appForId(requestedId); if(!baseApp)return
    app={...baseApp,name:requestedId}
    setContextMenu(null); setStartOpen(false); setSearchOpen(false)
    if (app.kind==='store') { const k=requestedId==='DAPP'?'DAPP':'desktop:'+requestedId+':'+Date.now(); setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:prev[k]?{...prev[k],minimized:false,z:maxZ+1}:{kind:'store',appName:'DAPP',minimized:false,maximized:false,x:35,y:30,width:Math.min(window.innerWidth-40,980),height:Math.min(window.innerHeight-90,680),z:maxZ+1,taskbarInstance:true}}}); setActiveWindow(k); return }
    if (app.kind==='trash' && requestedId==='DaTrash') { setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,DaTrash:prev.DaTrash?{...prev.DaTrash,minimized:false,z:maxZ+1}:{kind:'trash',appName:'DaTrash',minimized:false,maximized:false,x:60,y:45,width:Math.min(window.innerWidth-40,900),height:Math.min(window.innerHeight-90,620),z:maxZ+1,taskbarInstance:true}}}); setActiveWindow('DaTrash'); return }
    if (app.kind==='music' && desktopInstance) { const base={...baseApp,name:'DaMusic'}; openApp(base,false); return }
    if (app.kind==='scope') { const k=(desktopInstance?'desktop:':'taskbar:')+requestedId+':'+Date.now(); setWindows(prev=>{const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0));return {...prev,[k]:{kind:'scope',appName:'DaScope',minimized:false,maximized:false,x:45,y:35,width:Math.min(window.innerWidth-40,1050),height:Math.min(window.innerHeight-90,700),z:maxZ+1,taskbarInstance:!desktopInstance}}});setActiveWindow(k);return }
    const k = desktopInstance ? `desktop:${requestedId}:${Date.now()}` : requestedId
    setWindows(prev => { const maxZ=Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0)); const existing=prev[k]; return {...prev,[k]:existing?{...existing,minimized:false,z:maxZ+1}:{kind:app.kind,appName:app.name,minimized:false,maximized:false,x:20 + Object.keys(prev).length*18,y:18 + Object.keys(prev).length*18,width:Math.min(window.innerWidth-40,1050),height:Math.min(window.innerHeight-90,700),z:maxZ+1,taskbarInstance:!desktopInstance,appInstanceId:requestedId}} })
    setActiveWindow(k)
  }
  const patchWindow = (key:string, patch:any) => setWindows(prev => {
    if (!prev[key]) return prev
    const maxZ = Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0))
    return {...prev,[key]:{...prev[key],...patch,z:maxZ+1}}
  })
  const focusWindow = (key:string) => {
    setWindows(prev => {
      if (!prev[key]) return prev
      const maxZ = Math.max(0,...Object.values(prev).map((w:any)=>Number(w?.z)||0))
      const next={...prev,[key]:{...prev[key],minimized:false,z:maxZ+1}}
      return next
    })
    setActiveWindow(key)
  }
  const closeWindow = (key:string) => { setWindows(prev => { const n={...prev}; delete n[key]; return n }); setActiveWindow(null); setContextMenu(null) }
  const clearDragGhost = () => {
    document.querySelectorAll('.ida-drag-ghost').forEach(n=>n.remove())
    document.body.style.cursor=''
  }
  const makeDragGhost = (source:HTMLElement) => {
    clearDragGhost()
    const r=source.getBoundingClientRect()
    const ghost=source.cloneNode(true) as HTMLElement
    ghost.classList.add('ida-drag-ghost')
    ghost.style.position='fixed'; ghost.style.left='0'; ghost.style.top='0'
    ghost.style.width=r.width+'px'; ghost.style.height=r.height+'px'; ghost.style.margin='0'
    ghost.style.pointerEvents='none'; ghost.style.zIndex='2147483647'; ghost.style.opacity='.58'
    document.body.appendChild(ghost)
    return ghost
  }

  useEffect(() => {
    if (!mounted || !wallpaperRotation) return
    const entries = Object.entries(WALLPAPERS)
    const rotation = includeOwnWallpaper && customWallpaper ? [...entries, ['My wallpaper', customWallpaper] as [string,string]] : entries
    const timer = window.setInterval(() => {
      const current = rotation.findIndex(([,value]) => value === wallpaper)
      const next = rotation[(current + 1 + rotation.length) % rotation.length]
      if (!next) return
      if (wallpaperFade) setPreviousWallpaper(wallpaper)
      setWallpaper(next[1])
      window.setTimeout(() => setPreviousWallpaper(null), wallpaperFade ? 5200 : 0)
      try { localStorage.setItem('daapps-wallpaper', next[0] === 'My wallpaper' ? '' : next[0]) } catch {}
    }, 10000)
    return () => window.clearInterval(timer)
  }, [mounted, wallpaperRotation, wallpaper, wallpaperFade, includeOwnWallpaper, customWallpaper])

  const setTaskbarThemeMode = (theme:'default'|'aurora'|'sunset'|'ocean'|'manual') => {
    setTaskbarTheme(theme)
    try { localStorage.setItem('ida-taskbar-theme', theme) } catch {}
  }
  const setTaskbarManualMode = (color:string) => {
    setTaskbarManualColor(color)
    try { localStorage.setItem('ida-taskbar-manual-color', color) } catch {}
  }

  const setWallpaperRotationMode = (enabled:boolean) => {
    setWallpaperRotation(enabled)
    try { localStorage.setItem('ida-wallpaper-rotation-v2', enabled ? '1' : '0') } catch {}
  }
  const setWallpaperFadeMode = (enabled:boolean) => {
    setWallpaperFade(enabled)
    try { localStorage.setItem('ida-wallpaper-fade', enabled ? '1' : '0') } catch {}
  }
  const setIncludeOwnWallpaperMode = (enabled:boolean) => {
    setIncludeOwnWallpaper(enabled)
    if (!enabled && customWallpaper && wallpaper === customWallpaper) {
      const fallbackName = Object.keys(WALLPAPERS)[0]
      setWallpaper(WALLPAPERS[fallbackName])
      try { localStorage.setItem('daapps-wallpaper', fallbackName) } catch {}
    }
    try { localStorage.setItem('ida-wallpaper-own', enabled ? '1' : '0') } catch {}
  }

  const chooseWallpaper = (name: string) => {
    const next = WALLPAPERS[name]
    if (!next) return
    setWallpaper(next)
    try {
      localStorage.setItem('daapps-wallpaper', name)
      localStorage.setItem('ida-wallpaper-rotation', '0')
      localStorage.removeItem('daapps-custom-wallpaper')
    } catch {}
  }

  const openPowerMenu = () => { setSearchOpen(false); setPowerMenu(v=>!v); setStartOpen(true) }
  const shutdownIDA = () => { setPowerMenu(false); setStartOpen(false); setSearchOpen(false); setContextMenu(null); setShutdown(true); window.setTimeout(() => window.location.replace('about:blank'), 1800) }
  const sleepIDA = () => { setPowerMenu(false); setStartOpen(false); setSearchOpen(false); setContextMenu(null); setSleeping(true) }
  const refreshIDA = () => {
    try {
      localStorage.setItem('ida-open-windows-v1', JSON.stringify(windows))
      if (activeWindow && windows[activeWindow]) localStorage.setItem('ida-active-window-v1', activeWindow)
    } catch {}
    setContextMenu(null)
    setStartOpen(false)
    setSearchOpen(false)
    setPowerMenu(false)
    window.setTimeout(() => window.location.reload(), 80)
  }
  const chooseLanguage = (next:'en'|'cs'|'vi'|'ar-YE') => {
    setLanguageMenuOpen(false)
    setLanguagePrompt(next)
  }
  const applyLanguageAndRestart = () => {
    if (!languagePrompt) return
    try { localStorage.setItem('ida-language', languagePrompt) } catch {}
    setLanguage(languagePrompt)
    setLanguagePrompt(null)
    restartIDA()
  }

  const restartIDA = () => {
    setPowerMenu(false)
    setStartOpen(false)
    setSearchOpen(false)
    setContextMenu(null)
    setRestarting(true)
    window.setTimeout(() => window.location.reload(), 10000)
  }

  const uploadWallpaper = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const source = String(reader.result)
      setCustomWallpaper(source)
      setWallpaper(source)
      try { localStorage.setItem('daapps-custom-wallpaper', source); localStorage.removeItem('daapps-wallpaper') } catch {}
    }
    reader.readAsDataURL(file)
  }


  if (!mounted) return <div className="daapps-root" aria-hidden="true" />
  if (shutdown) return <ShutdownScreen />
  if (sleeping) return <SleepScreen onWake={()=>setSleeping(false)} />
  if (restarting) return <RestartScreen />

  return (
    <main
      className="daapps-root"
      style={{ background:'#05070d' }}
      onPointerDown={(e) => { if(e.button===0){setContextMenu(null); setTaskbarMenu(null); setStartOpen(false); setSearchOpen(false); setControlOpen(false)} }}
      onContextMenuCapture={(e) => {
        if (!desktop) return
        const target = e.target as HTMLElement
        if (target.closest('.desktop-context') || target.closest('.webapp-frame') || target.closest('.external-app-frame') || target.closest('.taskbar-context')) return
        if (target.closest('.app-window')) return
        const tile = target.closest('.app-tile') as HTMLElement | null
        if (tile) {
          const name = tile.getAttribute('aria-label')
          const app = APPS.find(a=>a.name===name)
          if (app) { e.preventDefault(); e.stopPropagation(); setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',app,folder:'Desktop'}); return }
        }
        const folderTile = target.closest('.desktop-folder-tile') as HTMLElement | null
        const fileTile = target.closest('.desktop-file-tile') as HTMLElement | null
        if (folderTile || fileTile) {
          e.preventDefault()
          e.stopPropagation()
          if (folderTile) {
            const id = folderTile.getAttribute('data-drop-folder')
            const folderItem = folders.find(f => f.id === id)
            if (folderItem) setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',folderItem,folder:'Desktop'})
          } else if (fileTile) {
            const id = fileTile.getAttribute('data-drop-folder')
            const file = files.find(f => f.id === id)
            if (file) setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',file,folder:file.location||'Desktop'})
          }
          return
        }
        if (target.closest('.taskbar')) return
        if (target.closest('.home-screen')) { e.preventDefault(); e.stopPropagation(); setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',folder:'Desktop'}) }
      }}
      onContextMenu={(e) => { if (desktop && e.target===e.currentTarget) { e.preventDefault(); e.stopPropagation(); setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',folder:'Desktop'}) } }}
    >
      {previousWallpaper && wallpaperFade && <div key={'previous-'+previousWallpaper} className="wallpaper-layer wallpaper-previous" style={{backgroundImage:'url("'+previousWallpaper+'")'}} />}
      <div key={wallpaper} className="wallpaper-layer wallpaper-current" style={{backgroundImage:'url("'+wallpaper+'")'}} />
      <div className="wallpaper-overlay" />
      {brightness < 100 && <div className="brightness-overlay" style={{opacity:Math.max(0,Math.min(1,(100-brightness)/100))}} aria-hidden="true" />}
      <div className="home-screen" onDragOver={e=>{if(e.dataTransfer.types.includes('ida-copy-app') || e.dataTransfer.types.some(t=>t.startsWith('ida-'))){e.preventDefault();e.dataTransfer.dropEffect=e.dataTransfer.types.includes('ida-copy-app')?'copy':'move'}}} onDrop={e=>{e.preventDefault();const copyApp=e.dataTransfer.getData('ida-copy-app');if(copyApp){copyDraggedAppToDesktop(copyApp);return}const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id)moveDraggedItem(type,id,'Desktop')}} onPointerDown={(e) => {
        if(!desktop)return
        if(e.target!==e.currentTarget)return
        const r=e.currentTarget.getBoundingClientRect()
        desktopMarqueeRef.current={sx:e.clientX-r.left,sy:e.clientY-r.top,button:e.button as 0|2,dragged:false,active:true}
        if(e.button===0 && e.target===e.currentTarget){setSelectedApp(null);setSelectedDesktopItem(null);setSelectedDesktopIds([]);setSelectedDesktopApps([]);if(editMode)setEditMode(false)}
        if(e.button===2){e.preventDefault();e.stopPropagation()}
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }} onPointerMove={(e)=>{
        const q=desktopMarqueeRef.current;if(!q.active)return;if(e.buttons!==q.button)return
        const r=e.currentTarget.getBoundingClientRect(),ex=e.clientX-r.left,ey=e.clientY-r.top,w=Math.abs(ex-q.sx),h=Math.abs(ey-q.sy)
        if(w<5&&h<5)return
        q.dragged=true;const x=Math.min(q.sx,ex),y=Math.min(q.sy,ey);setDesktopMarquee({x,y,w,h,button:q.button})
        const box={l:r.left+x,t:r.top+y,r:r.left+x+w,b:r.top+y+h};const ids:string[]=[];const appsIn:string[]=[]
        e.currentTarget.querySelectorAll<HTMLElement>('.desktop-file-tile,.app-tile').forEach(el=>{const b=el.getBoundingClientRect();if(b.right>=box.l&&b.left<=box.r&&b.bottom>=box.t&&b.top<=box.b){if(el.classList.contains('app-tile'))appsIn.push(el.getAttribute('aria-label')||'');else ids.push(el.getAttribute('data-drop-folder')||'')}})
        setSelectedDesktopIds(ids.filter(Boolean));setSelectedDesktopApps(appsIn.filter(Boolean))
      }} onPointerUp={(e)=>{
        const q=desktopMarqueeRef.current;desktopMarqueeRef.current={sx:0,sy:0,button:0,dragged:false,active:false}
        if(q?.active&&q.dragged&&q.button===2){const hit=e.currentTarget.querySelector<HTMLElement>('.app-tile-selected,.desktop-file-tile.app-tile-selected');if(hit){const appName=hit.getAttribute('aria-label')||'';const app=APPS.find(a=>a.name===appName);const id=hit.getAttribute('data-drop-folder')||'';const file=files.find(f=>f.id===id);const folderItem=folders.find(f=>f.id===id);setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',app,file,folderItem,folder:'Desktop'})}}
        setDesktopMarquee(null)
      }} onContextMenu={(e)=>{e.preventDefault();e.stopPropagation();if(desktop&&!desktopMarqueeRef.current.dragged&&e.target===e.currentTarget)setContextMenu({x:e.clientX,y:e.clientY,scope:'desktop',folder:'Desktop'})}}>        {desktopMarquee && <div className="desktop-selection-marquee" style={{left:desktopMarquee.x,top:desktopMarquee.y,width:desktopMarquee.w,height:desktopMarquee.h}} aria-hidden="true" />}
        {desktopApps.map((desktopEntry,desktopIndex) => { const appName=appBaseId(desktopEntry); const app=appForId(desktopEntry); if(!app)return null; const basePos=positions[app.name]||DEFAULT_POSITIONS[app.name]||{x:3,y:4}; const isCopy=desktopEntry.includes('::copy-'); const displayPos=isCopy&&!positions[desktopEntry]?{x:Math.min(82,basePos.x+Math.min(12,desktopIndex*3)),y:Math.min(82,basePos.y+Math.min(12,desktopIndex*2))}:positions[desktopEntry]||basePos; return (
          <AppTile
            key={desktopEntry}
            app={app}
            displayName={appLabels[desktopEntry] || appLabels[app.name] || app.name}
            position={displayPos}
            editMode={editMode}
            onEdit={() => setEditMode(true)}
            onOpen={() => { if(app.name==='DaScope') openApp({...app,name:desktopEntry},true); else if(app.name==='DaSettings') openApp(app,false); else if(app.kind==='external') openWebAppInstance({...app,name:desktopEntry},true); else openApp({...app,name:desktopEntry},true) }}
            selected={selectedApp === app.name || selectedDesktopApps.includes(desktopEntry) || selectedDesktopApps.includes(app.name)}
            onSelect={() => { setSelectedApp(app.name); setSelectedDesktopItem(null); setSelectedDesktopApps([desktopEntry]); setSelectedDesktopIds([]) }}
            onMove={(pos) => moveDesktopItem('app',desktopEntry,pos)}
            onDropTarget={(target) => moveDraggedItem('app',desktopEntry,target)}
            
            onContext={(x,y) => desktop && setContextMenu({x,y,scope:'desktop',app:{...app,name:desktopEntry},folder:'Desktop'})}
            scale={desktop ? iconScale : 1}
          />
        )})}
        {desktop && folders.filter(f=>f.parent==='Desktop').map((folder,index)=>{const savedPos=filePositions[folder.id];const pos=savedPos&&!(savedPos.x===5&&savedPos.y===34)?savedPos:{x:18+(index%5)*14,y:10+Math.floor(index/5)*14};return <DesktopFolderTile key={folder.id} folder={folder} scale={iconScale} left={pos.x} top={pos.y} selected={selectedDesktopItem?.type==='folder'&&selectedDesktopItem.id===folder.id || selectedDesktopIds.includes(folder.id)} onSelect={()=>{setSelectedApp(null);setSelectedDesktopItem({type:'folder',id:folder.id});setSelectedDesktopIds([folder.id]);setSelectedDesktopApps([])}} onOpen={()=>openExplorerFolder(folder.id)} onContext={(x,y)=>setContextMenu({x,y,scope:'desktop',folderItem:folder,folder:'Desktop'})} onMove={(p)=>moveDesktopItem('folder',folder.id,p)} onDropTarget={(target)=>moveDraggedItem('folder',folder.id,target)} />})}
        {desktop && files.filter(f=>f.location==='Desktop').map((file,index)=>{
          const savedPos=filePositions[file.id]; const pos=savedPos&&!(savedPos.x===5&&savedPos.y===34)?savedPos:{x:18+(index%5)*14,y:10+Math.floor(index/5)*14}
          return <DesktopFileTile key={file.id} file={file} scale={iconScale} left={pos.x} top={pos.y} selected={selectedDesktopItem?.type==='file'&&selectedDesktopItem.id===file.id || selectedDesktopIds.includes(file.id)} onSelect={()=>{setSelectedApp(null);setSelectedDesktopItem({type:'file',id:file.id});setSelectedDesktopIds([file.id]);setSelectedDesktopApps([])}} onOpen={()=>openUserFile(file)} onContext={(x,y)=>setContextMenu({x,y,scope:'desktop',file,folder:file.id})} onMove={(p)=>moveDesktopItem('file',file.id,p)} onDropTarget={(target,type,sourceId)=>moveDraggedItem(type||'file',sourceId||file.id,target)} />
        })}
      </div>

      {controlOpen && <ControlCenter brightness={brightness} setBrightness={setBrightness} internetOn={internetOn} setInternetOn={setInternetState} volume={volume} setVolume={setVolume} onVolumeChange={(v)=>{setVolume(v);playVolumeTest(v)}} batteryLevel={batteryLevel} batteryCharging={batteryCharging} onClose={() => setControlOpen(false)} />}

      {Object.entries(windows).map(([key, win]) => {
        const app = appForId(key) || (win.appName ? appForId(win.appName) : null) || (win.kind==='scope' ? ({name:'DaScope',kind:'scope',tone:'blue'} as AppItem) : win.kind==='media' ? ({name:'DaMedia',kind:'media',tone:'blue'} as AppItem) : win.kind==='notes' ? ({name:'DaNotes',kind:'notes',tone:'slate'} as AppItem) : win.kind==='explorer' ? ({name:folders.find(f=>f.id===win.folderId)?.name||'File',kind:'explorer',tone:'blue'} as AppItem) : (win.fileId ? ({name:files.find(f=>f.id===win.fileId)?.name||key,kind:'external',tone:'blue'} as AppItem) : null))
        if (!app) return null
        const userFile = win.fileId ? files.find(f=>f.id===win.fileId) : undefined
        return <WindowFrame key={key} app={app} state={win} active={activeWindow===key} onContextMenu={win.externalUrl ? undefined : (x,y)=>{setContextMenu({x,y,scope:'window',windowKey:key});setStartOpen(false);setSearchOpen(false);setPowerMenu(false)}} onFocus={()=>focusWindow(key)} onPatch={(p)=>patchWindow(key,p)} onMinimize={()=>patchWindow(key,{minimized:true})} onClose={()=>closeWindow(key)} onMaximize={()=>patchWindow(key,{maximized:!win.maximized})}>
          {win.kind==='scope' ? <DaScopeSearch/> : win.externalUrl ? <WebAppPanel url={win.externalUrl}/> : (win.kind==='store'||key==='DAPP') ? <DappStore internetOn={internetOn} installed={isDappInstalled} onInstall={(name)=>{saveDesktopApps([...desktopApps.filter(x=>x!==name),name]);saveTaskbar([...taskbarApps.filter(x=>x!==name),name])}} onUninstall={uninstallDapp} onOpen={(name)=>{const a=APPS.find(x=>x.name===name);if(a)openApp(a)}} /> : (key==='DaTrash'||win.kind==='trash') ? <DaTrash trash={trash} onRestore={restoreFromTrash} onEmpty={emptyTrash} onPermanentDelete={(item)=>{if(item.type==='app'&&item.id==='DaSettings')return;saveTrash(trash.filter(t=>!(t.type===item.type&&t.id===item.id)))}}/> : win.kind==='media' ? <DaMedia file={userFile}/> : win.kind==='music' ? <MusicPanel volume={volume}/> : win.kind==='settings' ? <SettingsPanel taskbarTheme={taskbarTheme} taskbarManualColor={taskbarManualColor} onTaskbarTheme={setTaskbarThemeMode} onTaskbarManualColor={setTaskbarManualMode} onPreset={chooseWallpaper} onUpload={uploadWallpaper} iconScale={iconScale} onScale={(v)=>{setIconScale(v);try{localStorage.setItem('ida-icon-scale',String(v))}catch{}}} wallpaperRotation={wallpaperRotation} wallpaperFade={wallpaperFade} includeOwnWallpaper={includeOwnWallpaper} customWallpaper={customWallpaper} onRotation={setWallpaperRotationMode} onFade={setWallpaperFadeMode} onIncludeOwn={setIncludeOwnWallpaperMode}/> : win.kind==='notes' ? <DaNotes files={files} notes={notes} updateNotes={updateNotes} onNewNote={()=>addNote('Notes')} onDeleteNote={deleteNote} fileId={win.fileId}/> : win.kind==='explorer' ? <DaFileExplorer folder={win.folderId} setFolder={(next)=>patchWindow(key,{folderId:next})} files={files} folders={folders} folderApps={folderApps} apps={APPS} desktopApps={desktopApps} onImport={importFiles} onNewFile={addNewFile} onNewFolder={addNewFolder} onNewNote={addNote} onMoveFile={(id,location)=>folders.some(f=>f.id===id)?commitFolders(folders.map(f=>f.id===id?{...f,parent:location}:f)):commitFiles(files.map(x=>x.id===id?{...x,location}:x))} onMoveApp={(id,location)=>moveDraggedItem('app',id,location)} onEditFile={updateFileData} explorerPositions={explorerPositions} onExplorerMove={(id,y)=>saveExplorerPositions({...explorerPositions,[id]:y})} onOpen={openUserFile} onOpenApp={openApp} onContext={(x,y,item)=>setContextMenu({x,y,scope:'explorer',...item,folder:item.folderItem?.id||item.file?.id||item.file?.location||win.folderId})} onCopy={(type,id)=>{setClipboard({type,id,mode:'copy'});setContextMenu(null)}} onCut={(type,id)=>{setClipboard({type,id,mode:'cut'});setContextMenu(null)}} onPaste={()=>pasteClipboard(win.folderId)} onDelete={(type,id)=>deleteToTrash(type,id)} onAddDesktop={(id)=>{if(!desktopApps.includes(id))saveDesktopApps([...desktopApps,id])}} openFileId={null} setOpenFileId={()=>{}}/> : key==='DaMusic' ? <MusicPanel volume={volume}/> : key==='DaSettings' ? <SettingsPanel taskbarTheme={taskbarTheme} taskbarManualColor={taskbarManualColor} onTaskbarTheme={setTaskbarThemeMode} onTaskbarManualColor={setTaskbarManualMode} onPreset={chooseWallpaper} onUpload={uploadWallpaper} iconScale={iconScale} onScale={(v)=>{setIconScale(v);try{localStorage.setItem('ida-icon-scale',String(v))}catch{}}} wallpaperRotation={wallpaperRotation} wallpaperFade={wallpaperFade} includeOwnWallpaper={includeOwnWallpaper} customWallpaper={customWallpaper} onRotation={setWallpaperRotationMode} onFade={setWallpaperFadeMode} onIncludeOwn={setIncludeOwnWallpaperMode}/> : key==='DaFile Explorer' ? <DaFileExplorer folder={explorerFolder} setFolder={setExplorerFolder} files={files} folders={folders} folderApps={folderApps} apps={APPS} desktopApps={desktopApps} onImport={importFiles} onNewFile={addNewFile} onNewFolder={addNewFolder} onNewNote={addNote} onMoveFile={(id,location)=>folders.some(f=>f.id===id)?commitFolders(folders.map(f=>f.id===id?{...f,parent:location}:f)):commitFiles(files.map(x=>x.id===id?{...x,location}:x))} onMoveApp={(id,location)=>moveDraggedItem('app',id,location)} onEditFile={updateFileData} explorerPositions={explorerPositions} onExplorerMove={(id,y)=>saveExplorerPositions({...explorerPositions,[id]:y})} onOpen={openUserFile} onOpenApp={openApp} onContext={(x,y,item)=>setContextMenu({x,y,scope:'explorer',...item,folder:item.folderItem?.id||item.file?.id||item.file?.location||explorerFolder})} onCopy={(type,id)=>{setClipboard({type,id,mode:'copy'});setContextMenu(null)}} onCut={(type,id)=>{setClipboard({type,id,mode:'cut'});setContextMenu(null)}} onPaste={()=>pasteClipboard(explorerFolder)} onDelete={(type,id)=>deleteToTrash(type,id)} onAddDesktop={(id)=>{if(!desktopApps.includes(id))saveDesktopApps([...desktopApps,id])}} openFileId={explorerOpenFileId} setOpenFileId={setExplorerOpenFileId}/> : (key==='DaNotes'||key.startsWith('DaNotes:')) ? <DaNotes files={files} notes={notes} updateNotes={updateNotes} onNewNote={()=>addNote('Notes')} onDeleteNote={deleteNote} fileId={win.fileId}/> : userFile?.mime?.startsWith('image/') ? <div className="file-preview"><img src={userFile.data} alt={userFile.name}/></div> : userFile?.mime?.startsWith('video/') ? <div className="file-preview"><video src={userFile.data} controls/></div> : <div className="file-preview file-text-preview">Blank file</div>}
        </WindowFrame>
      })}
      {desktop && <IDATaskbar taskbarTheme={taskbarTheme} taskbarManualColor={taskbarManualColor} onReorder={saveTaskbar} onLogoDrop={copyDraggedAppToDesktop} apps={taskbarApps} openApps={Object.keys(windows)} windowsForTaskbar={windows} windowLabels={Object.fromEntries(Object.entries(windows).filter(([k])=>k.includes(':')||k==='DaTrash').map(([k,w])=>[k,w.kind==='external'?(w.appName||k):w.kind==='explorer'?(folders.find(f=>f.id===w.folderId)?.name||'File'):k==='DaTrash'?'DaTrash':files.find(f=>f.id===w.fileId)?.name||'Window']))} active={activeWindow} clock={clock} onWindow={(k)=>{ const w=windows[k]; if(!w) return; if(activeWindow===k && !w.minimized){ patchWindow(k,{minimized:true}); setActiveWindow(null); } else { focusWindow(k); } }}
        onStart={()=>{setSearchOpen(false);setPowerMenu(false);setStartOpen(v=>!v)}}
        onSearch={()=>{setStartOpen(false);setPowerMenu(false);setSearchOpen(v=>!v)}}
        onApp={(n)=>{const existing=Object.entries(windows).filter(([k,w])=>k===n || (w?.taskbarInstance===true&&w?.appName===n)).sort((a,b)=>(b[1]?.z||0)-(a[1]?.z||0))[0];if(existing){const [k,w]=existing;if(activeWindow===k&&!w.minimized){patchWindow(k,{minimized:true});setActiveWindow(null)}else{focusWindow(k)}return}const a=APPS.find(x=>x.name===n);if(a)openApp(a)}}
        onControl={()=>setControlOpen(v=>!v)}
        language={language}
        languageMenuOpen={languageMenuOpen}
        onLanguageMenu={()=>setLanguageMenuOpen(v=>!v)}
        onLanguage={chooseLanguage}
        onTaskbarContext={(x,y,n,key)=>{const latest=Object.entries(windows).filter(([k,w])=>(k===n||w?.appName===n)&&w?.taskbarInstance===true).sort((a,b)=>(b[1]?.z||0)-(a[1]?.z||0))[0];setStartOpen(false);setSearchOpen(false);setPowerMenu(false);setTaskbarMenu({x,y,name:n,key:latest?.[0]||key,running:!!latest})}}
        onTaskbarHover={(key)=>{if(taskbarHoverTimer.current)window.clearTimeout(taskbarHoverTimer.current);taskbarHoverTimer.current=window.setTimeout(()=>setTaskbarPreview(key),1000)}}
        onTaskbarLeave={()=>{if(taskbarHoverTimer.current)window.clearTimeout(taskbarHoverTimer.current);setTaskbarPreview(null)}}/>} 
      {desktop && taskbarPreview && <TaskbarPreview windowKey={taskbarPreview} win={windows[taskbarPreview]} app={windows[taskbarPreview]?.appName?APPS.find(a=>a.name===windows[taskbarPreview].appName):APPS.find(a=>a.name===taskbarPreview)} />}
      {desktop && startOpen && <StartMenu apps={APPS.filter(a=>!DAPP_CATALOG.some(d=>d.name===a.name)||isDappInstalled(a.name))} onOpen={openApp} powerOpen={powerMenu} onPower={openPowerMenu} onShutdown={shutdownIDA} onSleep={sleepIDA} onRestart={restartIDA} onCancel={()=>setPowerMenu(false)}/>}
      {desktop && searchOpen && <SearchPanel apps={APPS.filter(a=>!DAPP_CATALOG.some(d=>d.name===a.name)||isDappInstalled(a.name))} query={search} setQuery={setSearch} onOpen={openApp}/>} 
      {contextMenu?.scope==='window' ? <NativeWindowContextMenu menu={contextMenu} onMinimize={()=>{if(contextMenu.windowKey)patchWindow(contextMenu.windowKey,{minimized:true});setContextMenu(null)}} onClose={()=>{if(contextMenu.windowKey)closeWindow(contextMenu.windowKey)}}/> : contextMenu && <DesktopContextMenu menu={contextMenu} taskbarApps={taskbarApps} clipboard={clipboard} onAdd={(n)=>{if(!taskbarApps.includes(n))saveTaskbar([...taskbarApps,n]);setContextMenu(null)}} onRemove={(n)=>{saveTaskbar(taskbarApps.filter(x=>x!==n));setContextMenu(null)}} onRefresh={refreshIDA} onNewFolder={()=>{const target=contextMenu?.folderItem?.id||contextMenu?.folder||'Desktop';addNewFolder(target);setContextMenu(null)}} onNewNote={()=>{addNote((contextMenu?.folder==='Home'?'Desktop':contextMenu?.folder||'Desktop') as 'Desktop'|'Pictures'|'Music'|'Videos');setContextMenu(null)}} onOpen={(a)=>{openApp(a);setContextMenu(null)}} onOpenFile={(f)=>{openUserFile(f);setContextMenu(null)}} onOpenFolder={(f)=>{setExplorerFolder(f.id);setExplorerOpenFileId(null);const explorer=APPS.find(a=>a.name==='DaFile Explorer');if(explorer)openApp(explorer);setContextMenu(null)}} onRename={(item)=>{setContextMenu(null);setRenaming(item)}} onSettings={()=>openApp(APPS.find(a=>a.name==='DaSettings')!)} onCopy={(type,id)=>{setClipboard({type,id,mode:'copy'});setContextMenu(null)}} onCut={(type,id)=>{setClipboard({type,id,mode:'cut'});setContextMenu(null)}} onDelete={(type,id)=>{deleteToTrash(type,id);setContextMenu(null)}} onPaste={()=>{pasteClipboard(contextMenu.folder||'Desktop');setContextMenu(null)}}/>}
      {desktop && taskbarMenu && <TaskbarContextMenu menu={taskbarMenu} onRemove={()=>{if(!taskbarMenu.key||taskbarMenu.key===taskbarMenu.name)saveTaskbar(taskbarApps.filter(x=>x!==taskbarMenu.name));setTaskbarMenu(null)}} onOpen={()=>{const existing=Object.entries(windows).filter(([k,w])=>k===taskbarMenu.name||w?.taskbarInstance===true&&w?.appName===taskbarMenu.name).sort((a,b)=>(b[1]?.z||0)-(a[1]?.z||0))[0];if(existing){focusWindow(existing[0])}else{const a=APPS.find(x=>x.name===taskbarMenu.name);if(a)openApp(a)}setTaskbarMenu(null)}} onClose={()=>{const k=taskbarMenu.key||taskbarMenu.name;if(windows[k])closeWindow(k);setTaskbarMenu(null)}}/>} 
      {desktop && languagePrompt && <LanguageRestartDialog language={languagePrompt} onCancel={()=>setLanguagePrompt(null)} onRestart={applyLanguageAndRestart}/>} 
      {desktop && renaming && <RenameDialog value={renaming.name} onChange={name=>setRenaming({...renaming,name})} onCancel={()=>setRenaming(null)} onSave={()=>renameItem(renaming.type,renaming.id,renaming.name)}/>} 

    </main>
  )
}

function AppTile({ app, displayName, position, editMode, onEdit, onOpen, onMove, onDropTarget, onContext, scale, selected, onSelect }: {
  app: AppItem; displayName:string; position: Position; editMode: boolean; onEdit: () => void; onOpen: () => void; onMove: (p: Position) => void; onDropTarget:(target:string)=>void; onContext:(x:number,y:number)=>void; scale:number; selected:boolean; onSelect:()=>void
}) {
  const tileRef = useRef<HTMLButtonElement>(null)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const startPoint = useRef({ x: 0, y: 0 })
  const ghostRef = useRef<HTMLElement|null>(null)
  const clearGhost = () => { ghostRef.current?.remove(); ghostRef.current=null; document.body.style.cursor='' }

  const pointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    clearGhost()
    if (e.button === 2) return
    const rect = e.currentTarget.getBoundingClientRect()
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    startPoint.current = { x:e.clientX, y:e.clientY }
    dragging.current = false
  }

  const pointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.buttons !== 1) return
    if (!dragging.current && (Math.abs(e.clientX-startPoint.current.x)>8 || Math.abs(e.clientY-startPoint.current.y)>8)) {
      dragging.current = true
      onEdit()
      tileRef.current?.setPointerCapture(e.pointerId)
      if (tileRef.current) {
        tileRef.current.style.cursor = 'grabbing'
        tileRef.current.style.opacity = '.22'
        const g=tileRef.current.cloneNode(true) as HTMLElement
        const r=tileRef.current.getBoundingClientRect()
        g.classList.add('ida-drag-ghost'); g.style.position='fixed'; g.style.left='0'; g.style.top='0'; g.style.width=r.width+'px'; g.style.height=r.height+'px'; g.style.margin='0'; g.style.pointerEvents='none'; g.style.zIndex='2147483647'; g.style.opacity='.58'
        document.body.appendChild(g); ghostRef.current=g
      }
    }
    if (!dragging.current || !tileRef.current) return
    const tile = tileRef.current
    const parent = tile.parentElement?.getBoundingClientRect()
    if (!parent) return
    const maxX = Math.max(0, parent.width - tile.offsetWidth)
    const maxY = Math.max(0, parent.height - tile.offsetHeight)
    const x = Math.min(maxX, Math.max(0, e.clientX - parent.left - offset.current.x))
    const y = Math.min(maxY, Math.max(0, e.clientY - parent.top - offset.current.y))
    onMove({ x: (x / parent.width) * 100, y: (y / parent.height) * 100 })
    if(ghostRef.current){
      ghostRef.current.style.transform=`translate3d(${e.clientX-offset.current.x}px,${e.clientY-offset.current.y}px,0)`
      const hit=(document.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null)
      const folder=hit?.closest('[data-drop-folder]')
      const occupied=hit?.closest('.app-tile,.desktop-file-tile') && !folder
      ghostRef.current.classList.toggle('ida-drop-forbidden',!!occupied)
      document.body.style.cursor=occupied?'not-allowed':''
    }
  }

  const pointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button === 2) return
    const wasDragging = dragging.current
    dragging.current = false
    if (tileRef.current?.hasPointerCapture(e.pointerId)) tileRef.current.releasePointerCapture(e.pointerId)
    if (tileRef.current) { tileRef.current.style.cursor = editMode ? 'grab' : 'pointer'; tileRef.current.style.opacity='' }
    clearGhost()
    if (wasDragging) {
      const target=(document.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null)?.closest('[data-drop-folder]')?.getAttribute('data-drop-folder')
      if(target) onDropTarget(target)
    } else onSelect()
  }

  return (
    <button
      ref={tileRef}
      className={`app-tile ${selected ? 'app-tile-selected' : ''}`}
      style={{ left: `${position.x}%`, top: `${position.y}%`, ['--scale' as string]: scale }}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onClick={(e) => {
        if (dragging.current) return
        const now = Date.now()
        const last = (tileRef.current as any)?._idaLastClick || 0
        if (dragging.current) return
        ;(tileRef.current as any)._idaLastClick = Date.now()
      }}
      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen() }}
      onPointerCancel={() => { dragging.current = false }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContext(e.clientX,e.clientY) }}
      aria-label={app.name}
    >
      <span className={`app-icon tone-${app.tone}`}>
        <IdaAppIcon name={app.name} size={38}/>
      </span>
      <span className="app-name">{displayName}</span>
    </button>
  )
}

function DappLogo({size=38}:{size?:number}){return <span className="dapp-logo" style={{width:size,height:size}}><span className="dapp-logo-core">D</span><span className="dapp-logo-orbit orbit-a"/><span className="dapp-logo-orbit orbit-b"/></span>}
function DaScopeLogo({size=38}:{size?:number}){return <span className="dascope-logo" style={{width:size,height:size}} aria-hidden="true"><Moon size={size*0.86} strokeWidth={2.35}/></span>}
function DaScopeSearch(){const [query,setQuery]=useState('');const [searched,setSearched]=useState('');const [loading,setLoading]=useState(false);const submit=()=>{const q=query.trim();if(!q)return;setLoading(true);setSearched(q);window.setTimeout(()=>setLoading(false),650)};return <div className="dascope-search-shell"><div className="dascope-search-head"><DaScopeLogo size={48}/><div><strong>DaScope</strong><span>Search the web, simply.</span></div></div><form className="dascope-searchbar" onSubmit={e=>{e.preventDefault();submit()}}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the web..." autoFocus/><button type="submit" aria-label="Search"><Search size={17}/></button></form>{loading?<div className="dascope-results-loading"><div className="dascope-loader"/><span>Searching the web...</span></div>:searched?<div className="dascope-results"><div className="dascope-results-top"><strong>Results for “{searched}”</strong><span>Google-powered results will appear here</span></div>{['Web results','News & updates','Images & more'].map((label,i)=><a key={label} className="dascope-result" href={'https://www.google.com/search?q='+encodeURIComponent(searched+' '+label)} target="_blank" rel="noreferrer"><div className="dascope-result-dot">{i+1}</div><div><strong>{label} · {searched}</strong><span>Google search results for {searched}. Connect a Google Programmable Search Engine to populate live results here.</span><small>google.com</small></div><span className="dascope-result-arrow">↗</span></a>)}</div>:<div className="dascope-empty"><DaScopeLogo size={72}/><strong>What are you looking for?</strong><span>Search websites, ideas, news, and more.</span></div>}</div>}
function IdaAppIcon({name,size=28}:{name:string;size?:number}){return name==='DAPP'?<DappLogo size={size}/>:name==='DaScope'?<DaScopeLogo size={size}/>:name==='DaEconomy'?<BankIcon size={size}/>:name==='DaCourt'?<Scale size={size}/>:name==='DaMusic'?<Music2 size={size}/>:name==='DaFile Explorer'?<Folder size={size}/>:name==='DaNotes'?<FileText size={size}/>:name==='DaTrash'?<Trash2 size={size}/>:name==='DaSettings'?<Gear size={size}/>:name==='DaMedia'?<Film size={size}/>:<Folder size={size}/>} 

function DappStore({internetOn,installed,onInstall,onUninstall,onOpen}:{internetOn:boolean;installed:(name:string)=>boolean;onInstall:(name:string)=>void;onUninstall:(name:string)=>void;onOpen:(name:string)=>void}){
  const [query,setQuery]=useState(''); const [selected,setSelected]=useState<DappCatalogItem|null>(null); const [installing,setInstalling]=useState<string|null>(null); const [uninstalling,setUninstalling]=useState<string|null>(null); const [progress,setProgress]=useState(0); const [confirm,setConfirm]=useState<string|null>(null); const [voterId,setVoterId]=useState('')
  const results=DAPP_CATALOG.filter(a=>(a.name+' '+a.description+' '+a.category).toLowerCase().includes(query.toLowerCase()))
  const getLocalRatings=()=>{try{return JSON.parse(localStorage.getItem('ida-dapp-ratings')||'{}')}catch{return {}}}
  const ratings=getLocalRatings()
  const appRatings=(selected&&ratings[selected.name])||[]
  const total=appRatings.length
  const average=total?appRatings.reduce((a:number,b:number)=>a+b,0)/total:0
  const breakdown={one:appRatings.filter((n:number)=>n===1).length,two:appRatings.filter((n:number)=>n===2).length,three:appRatings.filter((n:number)=>n===3).length,four:appRatings.filter((n:number)=>n===4).length,five:appRatings.filter((n:number)=>n===5).length}
  const myRating=selected&&voterId?Number(localStorage.getItem('ida-rating-'+selected.name+'-'+voterId)||0):0
  useEffect(()=>{try{let id=localStorage.getItem('dapp-voter-id');if(!id){id='voter-'+crypto.randomUUID();localStorage.setItem('dapp-voter-id',id)}setVoterId(id)}catch{setVoterId('voter-'+Math.random().toString(36).slice(2))}},[])
  const startInstall=(name:string)=>{if(installing||uninstalling||!internetOn)return;setInstalling(name);setProgress(0);let p=0;const timer=window.setInterval(()=>{p=Math.min(100,p+Math.floor(Math.random()*13)+5);setProgress(p);if(p>=100){window.clearInterval(timer);setInstalling(null);setProgress(0);onInstall(name)}},180)}
  const startUninstall=(name:string)=>{if(uninstalling||installing)return;setConfirm(null);setUninstalling(name);setProgress(0);let p=0;const timer=window.setInterval(()=>{p=Math.min(100,p+Math.floor(Math.random()*10)+7);setProgress(p);if(p>=100){window.clearInterval(timer);setUninstalling(null);setProgress(0);onUninstall(name)}},120)}
  const submitRating=(name:string,n:number)=>{if(!internetOn||!voterId)return;try{const all=getLocalRatings();all[name]=[...(all[name]||[]),n];localStorage.setItem('ida-dapp-ratings',JSON.stringify(all));localStorage.setItem('ida-rating-'+name+'-'+voterId,String(n));setSelected(prev=>prev?{...prev}:prev)}catch{}}
  const icon=(name:string,size=34)=><span className={'dapp-icon-tone tone-'+(DAPP_CATALOG.find(x=>x.name===name)?.tone||'blue')}><IdaAppIcon name={name} size={size}/></span>
  return <div className="dapp-shell">{!internetOn?<div className="dapp-offline-screen"><DappLogo size={72}/><div className="dapp-offline-spinner"/><strong>Connection lost</strong><span>Turn on Wi‑Fi to reconnect to DAPP.</span><small>DAPP will keep waiting here until the connection returns.</small></div>:selected?<><div className="dapp-top"><button className="dapp-back" onClick={()=>setSelected(null)}>← <span>Back</span></button><div className="dapp-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps..."/></div></div><div className="dapp-detail"><div className="dapp-detail-hero"><div className="dapp-big-icon">{icon(selected.name,62)}</div><div className="dapp-detail-main"><h1>{selected.name}</h1><p className="dapp-tagline">{selected.tagline}</p><div className="dapp-meta"><span>{total?('★ '+average.toFixed(1)+' · '+total+' '+(total===1?'rating':'ratings')):'☆ No ratings yet'}</span><span>{selected.category}</span></div><div className="dapp-action">{installing===selected.name?<div className="dapp-installing"><div><strong>Installing...</strong><span>{progress}%</span></div><div className="dapp-progress"><i style={{width:progress+'%'}}/></div><small>Preparing {selected.name} for IDA</small></div>:uninstalling===selected.name?<div className="dapp-installing dapp-uninstalling"><div><strong>Uninstalling...</strong><span>{progress}%</span></div><div className="dapp-progress"><i style={{width:progress+'%'}}/></div><small>Removing {selected.name} from IDA...</small></div>:installed(selected.name)?<button className="dapp-uninstall" onClick={()=>setConfirm(selected.name)}>Uninstall</button>:<button className="dapp-install" disabled={!internetOn} onClick={()=>startInstall(selected.name)}><Download size={17}/> Install</button>}</div></div></div><section className="dapp-description"><h2>Description</h2><p>{selected.description}</p><h2>Ratings</h2><div className="dapp-rating-summary"><strong>{total?average.toFixed(1):'—'}</strong><div><div className="dapp-stars-static">{[1,2,3,4,5].map(n=><span key={n} className={average>=n-.25?'filled':''}>★</span>)}</div><small>{total?(total+' '+(total===1?'vote':'votes')):'No votes yet'}</small></div></div><div className="dapp-rating-breakdown">{([5,4,3,2,1] as const).map(n=>{const count=breakdown[['one','two','three','four','five'][n-1] as keyof typeof breakdown];const pct=total?count/total*100:0;return <div className="dapp-rating-row" key={n}><span>{n}</span><div><i style={{width:pct+'%'}}/></div><small>{count}</small></div>})}</div><h2 className="dapp-rate-title">Rate this app</h2><div className="dapp-stars">{[1,2,3,4,5].map(n=><button key={n} disabled={!internetOn||!voterId} className={n<=(myRating||0)?'active':''} onClick={()=>submitRating(selected.name,n)}>★</button>)}</div><small className="dapp-your-rating">{myRating?('Your rating: '+myRating+'/5'):'Choose a star to rate'}</small></section></div>{confirm&&<div className="dapp-confirm"><div><strong>Uninstall {confirm}?</strong><p>This removes the app from the IDA desktop, folders, taskbar, open windows, and DaTrash. You can install it again from DAPP anytime.</p><button onClick={()=>setConfirm(null)}>Cancel</button><button className="danger" onClick={()=>startUninstall(confirm)}>Uninstall</button></div></div>}</>:<><div className="dapp-header"><div className="dapp-brand"><DappLogo size={46}/><div><strong>DAPP</strong><span>IDA App Store</span></div></div><div className="dapp-search dapp-search-wide"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps..."/></div></div><div className="dapp-content"><div className="dapp-heading"><div><span className="eyebrow">IDA</span><h1>Discover apps</h1><p>Install apps into IDA and keep them wherever you organize them.</p></div><span className="dapp-count">{results.length} apps</span></div><div className="dapp-grid">{results.map((a,i)=><button key={a.name} style={{animationDelay:(i*55)+'ms'}} className="dapp-card" onClick={()=>setSelected(a)}><div className="dapp-card-top"><div className="dapp-card-icon">{icon(a.name,40)}</div><div><strong>{a.name}</strong><small>{a.tagline}</small></div></div></button>)}</div></div></>}</div>
}

function WebAppPanel({url}:{url:string}){return <iframe src={url} title="IDA web app" className="webapp-frame" />}

function DaMedia({file}:{file?:UserFile}){if(!file)return <div className="explorer-empty"><Film size={42}/><strong>No media selected</strong><span>Open a photo or video from DaFile Explorer.</span></div>;return <div className="media-shell"><div className="media-toolbar"><div><span className="eyebrow">IDA</span><h2>DaMedia</h2></div><span>{file.name}</span></div><div className="media-stage">{file.mime?.startsWith('image/')?<img src={file.data} alt={file.name}/>:<video src={file.data} controls autoPlay/>}</div></div>}
function DaTrash({trash,onRestore,onEmpty,onPermanentDelete}:{trash:Array<{type:'app'|'file'|'folder';id:string;name:string;app?:AppItem;file?:UserFile;folder?:UserFolder;deletedAt:number}>;onRestore:(item:any)=>void;onEmpty:()=>void;onPermanentDelete:(item:any)=>void}){const [menu,setMenu]=useState<{x:number;y:number;item:any}|null>(null);const [confirm,setConfirm]=useState<any>(null);return <div className="trash-shell" onPointerDown={()=>setMenu(null)}><div className="trash-toolbar"><div><span className="eyebrow">IDA</span><h2>DaTrash</h2></div><button onClick={onEmpty} disabled={!trash.length}>Empty Trash</button></div>{trash.length===0?<div className="explorer-empty"><Trash2 size={42}/><strong>Trash is empty</strong><span>Deleted apps, files, and notes will appear here.</span></div>:<div className="explorer-grid">{trash.map(item=><div key={item.type+item.id} className="explorer-card trash-card" onContextMenu={e=>{e.preventDefault();e.stopPropagation();setMenu({x:e.clientX,y:e.clientY,item})}}><span className="explorer-card-icon">{item.type==='app'?<Trash2 size={27}/>:item.file?.kind==='note'?<FileText size={27}/>:<Folder size={27}/>}</span><strong>{item.name}</strong><small>{item.type==='app'?'App':item.file?.kind==='note'?'Note':'File'}</small></div>)}</div>}{menu&&<div className="desktop-context taskbar-context" style={{left:Math.min(menu.x,window.innerWidth-150),top:Math.min(menu.y,window.innerHeight-70),zIndex:100001}} onPointerDown={e=>e.stopPropagation()}><button onClick={()=>{onRestore(menu.item);setMenu(null)}}><Folder size={14}/> Restore</button><button onClick={()=>{setConfirm(menu.item);setMenu(null)}}><X size={14}/> Permanently delete</button></div>}{confirm&&<div className="rename-backdrop" onPointerDown={()=>setConfirm(null)}><div className="rename-dialog" onPointerDown={e=>e.stopPropagation()}><strong>Permanently delete?</strong><p>This will permanently delete “{confirm.name}”. This action cannot be undone.</p><div><button onClick={()=>setConfirm(null)}>Cancel</button><button className="rename-save" onClick={()=>{onPermanentDelete(confirm);setConfirm(null)}}>OK</button></div></div></div>}</div>}

function BankIcon({size=38}:{size?:number}) {
  return <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 19 24 9l18 10" /><path d="M9 20h30" /><path d="M11 39h26" />
    <path d="M13 21v15M21 21v15M27 21v15M35 21v15" /><path d="M7 39h34" />
  </svg>
}

function ControlCenter({ brightness, setBrightness, internetOn, setInternetOn, volume, setVolume, onVolumeChange, batteryLevel, batteryCharging, onClose }: { brightness:number; setBrightness:(n:number)=>void; internetOn:boolean; setInternetOn:(v:boolean)=>void; volume:number; setVolume:(n:number)=>void; onVolumeChange:(n:number)=>void; batteryLevel:number|null; batteryCharging:boolean; onClose:()=>void }) {
  const now = new Date()
  return (
    <section className="control-center" role="dialog" aria-label="Control Center" onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
      <div className="control-top">
        <div><strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><span>{now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
        <button onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <button className={'internet-toggle '+(internetOn?'active':'')} onClick={()=>setInternetOn(!internetOn)} type="button"><span><Wifi size={18}/><strong>Wi‑Fi</strong></span><small>{internetOn?'On':'Off'}</small></button>
      <label className="volume-row brightness-row"><SunMedium size={18}/><input type="range" min="20" max="100" value={brightness} onChange={e=>setBrightness(Number(e.target.value))} aria-label="Brightness"/><span>{brightness}%</span></label>
      <label className="volume-row">{volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}<input type="range" min="0" max="100" value={volume} onChange={e => onVolumeChange(Number(e.target.value))} aria-label="Volume"/><span>{volume}%</span></label>
      {batteryLevel !== null && <div className="battery-status"><BatteryFull size={18}/><span>Battery</span><strong>{batteryLevel}%{batteryCharging?' · Charging':''}</strong></div>}
    </section>
  )
}

function MusicPanel({ volume }: { volume: number }) {
  const audioRef=useRef<HTMLAudioElement>(null); const [track,setTrack]=useState(0); const [playing,setPlaying]=useState(false); const current=TRACKS[track]
  useEffect(()=>{if(audioRef.current){audioRef.current.volume=volume/100;if(playing)audioRef.current.play().catch(()=>setPlaying(false))}},[volume,track])
  const toggle=()=>{if(!audioRef.current)return;if(playing){audioRef.current.pause();setPlaying(false)}else{audioRef.current.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false))}}
  return <div className="music-panel-content"><div className="music-hero"><div className="music-art"><Music2 size={48}/></div><div><span className="eyebrow">NOW PLAYING</span><h2>{current.title}</h2><p>{current.artist}</p></div></div><audio ref={audioRef} src={current.src} onEnded={()=>setTrack((track+1)%TRACKS.length)} preload="none"/><div className="track-list">{TRACKS.map((t,i)=><button className={`track-row ${i===track?'active':''}`} key={t.src} onClick={()=>{setTrack(i);setPlaying(false)}}><span>{i+1}</span><span><strong>{t.title}</strong><small>{t.artist}</small></span>{i===track&&playing?<Gauge size={16}/>:null}</button>)}</div><div className="player-controls"><button className="play-button" onClick={toggle} aria-label={playing?'Pause':'Play'}>{playing?<Pause size={22}/>:<Play size={22} fill="currentColor"/>}</button></div></div>
}
function SettingsPanel({ taskbarTheme, taskbarManualColor, onTaskbarTheme, onTaskbarManualColor, onPreset, onUpload, iconScale, onScale, wallpaperRotation, wallpaperFade, includeOwnWallpaper, customWallpaper, onRotation, onFade, onIncludeOwn }: { taskbarTheme:'default'|'aurora'|'sunset'|'ocean'|'manual'; taskbarManualColor:string; onTaskbarTheme:(v:'default'|'aurora'|'sunset'|'ocean'|'manual')=>void; onTaskbarManualColor:(v:string)=>void; onPreset:(name:string)=>void; onUpload:(file:File)=>void; iconScale?:number; onScale?:(n:number)=>void; wallpaperRotation:boolean; wallpaperFade:boolean; includeOwnWallpaper:boolean; customWallpaper:string|null; onRotation:(v:boolean)=>void; onFade:(v:boolean)=>void; onIncludeOwn:(v:boolean)=>void }) { return <div className="settings-content"><div className="settings-heading"><Gear size={18}/><div><h2>DaSettings</h2><p>Personalize your IDA desktop.</p></div></div><h3>Wallpaper</h3><div className="wallpaper-grid">{Object.entries(WALLPAPERS).map(([name,value])=><button key={name} className="wallpaper-choice" onClick={()=>onPreset(name)}><img src={value} alt=""/><span>{name}</span></button>)}</div><div className="wallpaper-controls"><label><span><strong>Wallpaper rotation</strong><small>Cycle the night wallpapers automatically.</small></span><input type="checkbox" checked={wallpaperRotation} onChange={e=>onRotation(e.target.checked)}/></label><label><span><strong>Fade between wallpapers</strong><small>Use a soft crossfade when the wallpaper changes.</small></span><input type="checkbox" checked={wallpaperFade} onChange={e=>onFade(e.target.checked)}/></label><label><span><strong>Include my wallpaper in rotation</strong><small>Your uploaded photo joins the 10-second wallpaper cycle.</small></span><input type="checkbox" checked={includeOwnWallpaper} disabled={!customWallpaper} onChange={e=>onIncludeOwn(e.target.checked)}/></label></div><label className="upload-wallpaper"><Download size={17}/><span>Upload custom wallpaper</span><input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&onUpload(e.target.files[0])}/></label><div className="settings-section"><h3>Taskbar</h3><div className="taskbar-theme-grid">{(['default','aurora','sunset','ocean','manual'] as const).map(theme=><button type="button" key={theme} className={'taskbar-theme-choice '+(taskbarTheme===theme?'active':'')} onClick={()=>onTaskbarTheme(theme)}><span className={'taskbar-theme-swatch '+theme} style={theme==='manual'?{background:taskbarManualColor}:undefined}/><span>{theme==='default'?'Default':theme==='aurora'?'Aurora':theme==='sunset'?'Sunset':'Ocean'}</span></button>)}</div><label className="taskbar-color-row"><span><strong>Manual color</strong><small>Pick a custom taskbar color.</small></span><input type="color" value={taskbarManualColor} onChange={e=>{onTaskbarManualColor(e.target.value);onTaskbarTheme('manual')}}/></label></div><div className="setting-row"><div><strong>Desktop icon size</strong><small>Adjust the size of desktop apps.</small></div><select value={iconScale} onChange={e=>onScale?.(Number(e.target.value))}><option value={0.75}>Small</option><option value={0.9}>Default</option><option value={1.1}>Large</option><option value={1.3}>Extra large</option></select></div></div>
}
function ExternalAppPanel({url,name}:{url:string;name:string}){return <iframe className="external-app-frame" src={url} title={name} />}
function ShutdownScreen(){return <div className="shutdown-screen"><div className="shutdown-logo">IDA</div><div className="shutdown-spinner"/><div className="shutdown-message">Shutting down IDA</div><div className="shutdown-sub">Closing IDA...</div></div>}
function SleepScreen({onWake}:{onWake:()=>void}){return <div className="shutdown-screen"><div className="shutdown-logo">IDA</div><div className="shutdown-message">IDA is sleeping</div><button className="wake-button" onClick={onWake}>Open IDA</button></div>}
function HilalLogo({small=false}:{small?:boolean}){return <span className={'hilal-logo '+(small?'hilal-small':'')} aria-hidden="true"><span className="hilal-crescent">☾</span></span>}
function RestartScreen(){return <div className="restart-screen"><div className="restart-logo"><HilalLogo/></div><div className="restart-spinner"><span/></div><div className="restart-message">Restarting IDA</div><div className="restart-sub">Don't turn off the web</div><div className="restart-progress"><span/></div><div className="restart-status">Almost there...</div></div>}
function PowerMenu({onShutdown,onSleep,onRestart,onCancel}:{onShutdown:()=>void;onSleep:()=>void;onRestart:()=>void;onCancel:()=>void}){return <section className="power-menu" onPointerDown={e=>e.stopPropagation()}><div className="power-title"><Power size={18}/><strong>Power</strong></div><button onClick={onShutdown}><Power size={18}/><span><strong>Shut down</strong><small>Close IDA</small></span></button><button onClick={onSleep}><span className="sleep-icon">◐</span><span><strong>Sleep</strong><small>Keep IDA open and resume later</small></span></button><button onClick={onRestart}><span className="restart-icon">↻</span><span><strong>Restart IDA</strong><small>Restart the IDA desktop</small></span></button><button className="power-cancel" onClick={onCancel}>Cancel</button></section>}

function WindowFrame({app,state,active,onFocus,onPatch,onMinimize,onClose,onMaximize,onContextMenu,children}:{app:AppItem;state:any;active:boolean;onFocus:()=>void;onPatch:(p:any)=>void;onMinimize:()=>void;onClose:()=>void;onMaximize:()=>void;onContextMenu?:(x:number,y:number)=>void;children:React.ReactNode}) {
  const ref=useRef<HTMLElement>(null),drag=useRef<any>(null),resize=useRef<any>(null)
  const down=(e:React.PointerEvent)=>{if(state.maximized||e.button!==0)return;onFocus();const r=ref.current!.getBoundingClientRect();drag.current={x:e.clientX,y:e.clientY,ox:r.left,oy:r.top};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}
  const move=(e:React.PointerEvent)=>{if(drag.current&&!state.maximized){const r=ref.current!.getBoundingClientRect();const nx=Math.max(0,Math.min(window.innerWidth-r.width,drag.current.ox+e.clientX-drag.current.x));const ny=Math.max(0,Math.min(window.innerHeight-48-r.height,drag.current.oy+e.clientY-drag.current.y));onPatch({x:nx,y:ny})}}
  const rd=(e:React.PointerEvent,edge:string)=>{if(state.maximized||immersive)return;onFocus();const r=ref.current!.getBoundingClientRect();resize.current={x:e.clientX,y:e.clientY,left:r.left,top:r.top,w:r.width,h:r.height,edge};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}
  const rm=(e:React.PointerEvent)=>{if(!resize.current||state.maximized||immersive)return;const q=resize.current,dx=e.clientX-q.x,dy=e.clientY-q.y;let left=q.left,top=q.top,w=q.w,h=q.h;if(q.edge.includes('e'))w=Math.max(420,q.w+dx);if(q.edge.includes('s'))h=Math.max(300,Math.min(q.h+dy,window.innerHeight-48-q.top));if(q.edge.includes('w')){const right=q.left+q.w;left=Math.max(0,Math.min(q.left+dx,right-420));w=right-left}if(q.edge.includes('n')){const bottom=q.top+q.h;top=Math.max(0,Math.min(q.top+dy,bottom-300));h=bottom-top}onPatch({x:left,y:top,width:w,height:h})}
  const resizeHandles=['n','e','s','w','ne','se','sw','nw']
  const action = (fn:()=>void) => (e:React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); e.stopPropagation(); fn() }
  const [immersive, setImmersive] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const chromeTimer = useRef<number | undefined>(undefined)
  const topZone = useRef(false)
  const handleImmersiveMouseMove = (e:React.MouseEvent<HTMLElement>) => {
    if (!immersive) return
    const atRoof = e.clientY <= 8
    if (atRoof && !topZone.current) {
      topZone.current = true
      setChromeVisible(true)
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current)
      chromeTimer.current = window.setTimeout(() => setChromeVisible(false), 2000)
    } else if (!atRoof) {
      topZone.current = false
    }
  }
  const requestClose = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 180)
  }
  const toggleImmersive = () => {
    setImmersive(v => {
      const next = !v
      topZone.current = false
      if (chromeTimer.current) window.clearTimeout(chromeTimer.current)
      setChromeVisible(!next)
      return next
    })
  }
  return <section ref={ref} className={'app-window desktop-window '+(active?'window-active ':'')+(immersive?'window-immersive ':'')+(closing?'window-closing':'')} style={{display:state.minimized?'none':undefined,left:immersive?0:(state.maximized?0:state.x),top:immersive?0:(state.maximized?0:state.y),right:immersive?0:(state.maximized?0:'auto'),bottom:immersive?0:(state.maximized?48:'auto'),width:immersive||state.maximized?'auto':state.width,height:immersive||state.maximized?'auto':state.height,zIndex:immersive?2147480001:Math.min(Number(state.z)||1,2147480000)}} onPointerDown={onFocus} onMouseMove={handleImmersiveMouseMove} onContextMenu={e=>{if(onContextMenu){e.preventDefault();e.stopPropagation();onContextMenu(e.clientX,e.clientY)}}} onContextMenuCapture={e=>{if((e.target as HTMLElement).closest('.desktop-context,.explorer-card,.desktop-file-tile,.app-tile,.explorer-main,.explorer-file-view,.trash-card')) return;if(onContextMenu){e.preventDefault();e.stopPropagation();onContextMenu(e.clientX,e.clientY)}}}>
    <div className={'window-bar '+(immersive && !chromeVisible ? 'chrome-hidden' : '')}>
      <div className="window-drag-area" onPointerDown={down} onPointerMove={move} onPointerUp={()=>drag.current=null} onDoubleClick={onMaximize}>
        <span className="window-title">{app.kind==='store'?<DappLogo size={19}/>:app.kind==='music'?<Music2 size={17}/>:app.kind==='trash'?<Trash2 size={17}/>:app.kind==='explorer'?<Folder size={17}/>:app.kind==='notes'?<FileText size={17}/>:app.kind==='settings'?<Gear size={17}/>:app.kind==='media'?<Film size={17}/>:app.name==='DaCourt'?<Scale size={17}/>:<BankIcon size={17}/>} {app.name}</span>
      </div>
      <div className="window-actions" onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}>
        <button type="button" onClick={action(onMinimize)} aria-label="Minimize"><Minus size={16}/></button>
        <button type="button" onClick={action(onMaximize)} aria-label={state.maximized?'Restore window':'Maximize window'}><Maximize2 size={15}/></button>
        <button type="button" onClick={action(toggleImmersive)} aria-label={immersive?'Exit fullscreen':'Fullscreen'}><ArrowUpDown size={15}/></button>
        <button type="button" className="close-btn" onClick={action(requestClose)} aria-label="Close"><X size={16}/></button>
      </div>
    </div>
    <div className="window-body">{children}</div>{!immersive&&!state.maximized&&resizeHandles.map(edge=><div key={edge} className={'resize-handle resize-'+edge} onPointerDown={e=>rd(e,edge)} onPointerMove={rm} onPointerUp={()=>resize.current=null}/>)}
  </section>
}
function IDATaskbar({taskbarTheme,taskbarManualColor,apps,openApps,windowLabels,windowsForTaskbar,active,clock,onStart,onSearch,onApp,onControl,onTaskbarContext,onTaskbarHover,onTaskbarLeave,onWindow,onReorder,onLogoDrop,language,languageMenuOpen,onLanguageMenu,onLanguage}:{apps:string[];openApps:string[];windowLabels:Record<string,string>;windowsForTaskbar?:Record<string,any>;active:string|null;clock:Date;onStart:()=>void;onSearch:()=>void;onApp:(n:string)=>void;onControl:()=>void;onTaskbarContext:(x:number,y:number,n:string,key?:string)=>void;onTaskbarHover:(k:string)=>void;onTaskbarLeave:()=>void;onWindow:(k:string)=>void;onReorder:(apps:string[])=>void;onLogoDrop:(id:string)=>void;taskbarTheme:'default'|'aurora'|'sunset'|'ocean'|'manual';taskbarManualColor:string;language:'en'|'cs'|'vi'|'ar-YE';languageMenuOpen:boolean;onLanguageMenu:()=>void;onLanguage:(v:'en'|'cs'|'vi'|'ar-YE')=>void}){const extra=openApps.filter(k=>!windowsForTaskbar?.[k]?.taskbarInstance);const [dragging,setDragging]=useState<string|null>(null);const [over,setOver]=useState<string|null>(null);const movePinned=(from:string,to:string)=>{if(from===to)return;const next=[...apps];const a=next.indexOf(from),b=next.indexOf(to);if(a<0||b<0)return;next.splice(a,1);next.splice(next.indexOf(to),0,from);onReorder(next)};const taskbarStyle=taskbarTheme==='manual'?{'--taskbar-manual':taskbarManualColor} as React.CSSProperties:undefined;return <div className={'taskbar taskbar-theme-'+taskbarTheme} style={taskbarStyle} onPointerDown={e=>e.stopPropagation()}><button className="ida-start" draggable onDragStart={e=>{e.dataTransfer.setData('ida-copy-source','ida-logo');e.dataTransfer.effectAllowed='copy'}} onDragOver={e=>{if(e.dataTransfer.types.includes('ida-copy-app')){e.preventDefault();e.dataTransfer.dropEffect='copy'}}} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('ida-copy-app');if(id)onLogoDrop(id)}} onClick={onStart}><HilalLogo small/></button><button className="search-box" onClick={onSearch}><Search size={17}/><span>Search</span></button><div className="taskbar-apps">{apps.map(n=>{const a=APPS.find(x=>x.name===n);if(!a)return null;return <button key={n} draggable onDragStart={()=>setDragging(n)} onDragEnter={e=>{e.preventDefault();setOver(n)}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragging)movePinned(dragging,n);setDragging(null);setOver(null)}} onDragEnd={()=>{setDragging(null);setOver(null)}} className={'taskbar-app '+(openApps.some(k=>(k===n||windowsForTaskbar?.[k]?.appName===n)&&windowsForTaskbar?.[k]?.taskbarInstance)?'running ':'')+(windowsForTaskbar?.[active||'']?.taskbarInstance&&windowsForTaskbar?.[active||'']?.appName===n?'selected ':'')+(dragging===n?'taskbar-dragging ':'')+(over===n&&dragging!==n?'taskbar-drop-target':'')} onClick={()=>onApp(n)} onMouseEnter={()=>{const candidates=openApps.filter(k=>(k===n||windowsForTaskbar?.[k]?.appName===n)&&windowsForTaskbar?.[k]?.taskbarInstance);const k=candidates.sort((a,b)=>(windowsForTaskbar?.[b]?.z||0)-(windowsForTaskbar?.[a]?.z||0))[0];if(k)onTaskbarHover(k)}} onMouseLeave={onTaskbarLeave} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onTaskbarContext(e.clientX,e.clientY,n,n)}} title={n}><span className={'mini-icon tone-'+a.tone}>{<IdaAppIcon name={n} size={20}/>}</span></button>})}{extra.map(k=>{const w=windowsForTaskbar?.[k];const parsedName=typeof k==='string'&&k.startsWith('desktop:')?k.split(':')[1]:k; const base=w?.appName?APPS.find(a=>a.name===w.appName):APPS.find(a=>a.name===parsedName)|| (w?.kind==='media'?APPS.find(a=>a.name==='DaMedia'):w?.kind==='notes'?APPS.find(a=>a.name==='DaNotes'):w?.kind==='explorer'?APPS.find(a=>a.name==='DaFile Explorer'):k==='DaTrash'?APPS.find(a=>a.name==='DaTrash'):undefined);const tone=base?.tone||'blue';return <button key={k} className={'taskbar-app running '+(active===k?'selected':'')} onClick={()=>onWindow(k)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onTaskbarContext(e.clientX,e.clientY,windowLabels[k]||k,k)}} title={windowLabels[k]||'Window'} onMouseEnter={()=>onTaskbarHover(k)} onMouseLeave={onTaskbarLeave}><span className={'mini-icon tone-'+tone}>{<IdaAppIcon name={base?.name||parsedName} size={20}/>}</span></button>})}</div><div className="tray"><div className="language-wrap"><button className="language-indicator" onClick={onLanguageMenu} aria-label="Language">{language==='en'?'ENG':language==='cs'?'CES':language==='vi'?'VIE':'ARA'}</button>{languageMenuOpen&&<div className="language-menu" onPointerDown={e=>e.stopPropagation()}><strong>Language</strong><button className={language==='en'?'active':''} onClick={()=>onLanguage('en')}>ENG · English</button><button onClick={()=>onLanguage('cs')}>CES · Czech</button><button onClick={()=>onLanguage('vi')}>VIE · Vietnamese</button><button onClick={()=>onLanguage('ar-YE')}>ARA · Yemeni Arabic</button></div>}</div><button onClick={onControl}><Wifi size={15}/><Volume2 size={15}/><BatteryFull size={17}/></button><div className="tray-clock">{clock.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}<small>{clock.toLocaleDateString([], {month:'2-digit',day:'2-digit',year:'numeric'})}</small></div></div></div>}
function LanguageRestartDialog({language,onCancel,onRestart}:{language:'en'|'cs'|'vi'|'ar-YE';onCancel:()=>void;onRestart:()=>void}){
  const label = language==='en' ? 'English' : language==='cs' ? 'Czech' : language==='vi' ? 'Vietnamese' : 'Yemeni Arabic'
  return <div className="rename-backdrop" onPointerDown={onCancel}><div className="rename-dialog language-restart-dialog" onPointerDown={e=>e.stopPropagation()}><strong>Restart to apply language change?</strong><p>The new language will be applied after restart.</p><div><button onClick={onCancel}>Cancel</button><button className="rename-save" onClick={onRestart}>Restart · {label}</button></div></div></div>
}
function TaskbarPreview({windowKey,win,app}:{windowKey:string;win:any;app?:AppItem}){if(!win)return null;const left=Math.min(Math.max(10,(window.innerWidth/2)-145),window.innerWidth-300);return <div className="taskbar-preview" style={{left}}>{win.externalUrl?<iframe src={win.externalUrl} title={app?.name||windowKey}/>:<div className="taskbar-preview-placeholder"><span className={'preview-icon tone-'+(app?.tone||'blue')}>{app?.name==='DaMusic'?<Music2 size={30}/>:app?.name==='DaSettings'?<Gear size={30}/>:app?.name==='DaCourt'?<Scale size={30}/>:app?.name==='DaNotes'?<FileText size={30}/>:app?.name==='DaTrash'?<Trash2 size={30}/>:app?.name==='DaMedia'?<Film size={30}/>:app?.name==='DaFile Explorer'?<Folder size={30}/>:<BankIcon size={30}/>}</span><strong>{app?.name||windowKey}</strong><small>Open window</small></div>}<div className="taskbar-preview-label">{app?.name||windowKey}</div></div>}
function StartMenu({apps,onOpen,powerOpen,onPower,onShutdown,onSleep,onRestart,onCancel}:{apps:AppItem[];onOpen:(a:AppItem)=>void;powerOpen:boolean;onPower:()=>void;onShutdown:()=>void;onSleep:()=>void;onRestart:()=>void;onCancel:()=>void}){return <section className="start-menu" onPointerDown={e=>e.stopPropagation()} onContextMenu={e=>{e.preventDefault();e.stopPropagation()}}><div className="start-search"><Search size={17}/><span>Search apps, settings, and more</span></div><div className="start-head"><div className="ida-badge"><HilalLogo small/></div><div><strong>Welcome to IDA</strong><small>Your desktop apps</small></div></div><div className="start-section-title"><strong>Pinned</strong><span>All apps ›</span></div><div className="start-grid">{apps.map(a=><button key={a.name} draggable={true} onPointerDown={e=>e.stopPropagation()} onDragStart={e=>{e.stopPropagation();e.dataTransfer.clearData();e.dataTransfer.setData('ida-copy-app',a.name);e.dataTransfer.setData('text/plain',a.name);e.dataTransfer.effectAllowed='copy'}} onDragEnd={()=>{}} onClick={()=>onOpen(a)}><span className={'start-icon tone-'+a.tone}>{<IdaAppIcon name={a.name} size={26}/>}</span><span>{a.name}</span></button>)}</div><div className="start-recent"><strong>Quick access</strong><span>Open an app from your desktop or taskbar</span></div><div className="start-footer"><span>IDA OS</span><button className="start-power" onClick={onPower} aria-label="Power options"><Power size={17}/></button></div>{powerOpen&&<PowerMenu onShutdown={onShutdown} onSleep={onSleep} onRestart={onRestart} onCancel={onCancel}/>}</section>}
function SearchPanel({apps,query,setQuery,onOpen}:{apps:AppItem[];query:string;setQuery:(s:string)=>void;onOpen:(a:AppItem)=>void}){const results=apps.filter(a=>a.name.toLowerCase().includes(query.toLowerCase()));return <section className="search-panel" onPointerDown={e=>e.stopPropagation()}><div className="search-big-input"><Search size={24}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps, settings, and more"/></div><div className="search-heading"><strong>{query ? 'Search results' : 'All apps'}</strong><span>{results.length} apps</span></div><div className="search-app-grid">{results.map(a=><button key={a.name} onClick={()=>onOpen(a)}><span className={'start-icon tone-'+a.tone}>{<IdaAppIcon name={a.name} size={26}/>}</span><span>{a.name}</span></button>)}</div></section>}
function DesktopFolderTile({folder,scale,left,top,selected,onSelect,onOpen,onContext,onMove,onDropTarget}:{folder:UserFolder;scale:number;left:number;top:number;selected:boolean;onSelect:()=>void;onOpen:()=>void;onContext:(x:number,y:number)=>void;onMove:(p:Position)=>void;onDropTarget:(target:string)=>void}){
  const drag=useRef<any>(null)
  return <button data-drop-folder={folder.id} className={'desktop-file-tile desktop-folder-tile '+(selected?'app-tile-selected':'')} style={{left:left+'%',top:top+'%', ['--scale' as string]:scale}} onPointerDown={e=>{if(e.button!==0)return;drag.current={x:e.clientX,y:e.clientY,ox:left,oy:top,moved:false};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current||e.buttons!==1)return;const r=e.currentTarget.parentElement?.getBoundingClientRect();if(!r)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(!drag.current.moved&&(Math.abs(dx)>6||Math.abs(dy)>6))drag.current.moved=true;if(drag.current.moved)onMove({x:Math.max(0,Math.min(92,drag.current.ox+dx/r.width*100)),y:Math.max(0,Math.min(88,drag.current.oy+dy/r.height*100))})}} onPointerUp={e=>{const wasMoved=drag.current?.moved;const target=(document.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null)?.closest('[data-drop-folder]')?.getAttribute('data-drop-folder');drag.current=null;if(wasMoved&&target){onDropTarget(target)}else if(!wasMoved)onSelect();if((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId))(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)}} onDoubleClick={e=>{e.preventDefault();onOpen()}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY)}}><span className="desktop-file-icon tone-blue"><Folder size={30}/></span><span className="desktop-file-name" title={folder.name}>{folder.name}</span></button>
}

function DesktopFileTile({file,scale,left,top,selected,onSelect,onOpen,onContext,onMove,onDropTarget}:{file:UserFile;scale:number;left:number;top:number;selected:boolean;onSelect:()=>void;onOpen:()=>void;onContext:(x:number,y:number)=>void;onMove:(p:Position)=>void;onDropTarget:(target:string,type?:'app'|'file'|'folder',sourceId?:string)=>void}){const drag=useRef<any>(null);return <button data-drop-folder={file.id} onDragOver={e=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='move'}} onDrop={e=>{e.preventDefault();e.stopPropagation();const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id&&id!==file.id)onDropTarget(file.id,type,id)}} className={'desktop-file-tile '+(selected?'app-tile-selected':'')} style={{left:left+'%',top:top+'%', ['--scale' as string]:scale}} onPointerDown={e=>{if(e.button!==0)return;drag.current={x:e.clientX,y:e.clientY,ox:left,oy:top,moved:false};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current||e.buttons!==1)return;const r=e.currentTarget.parentElement?.getBoundingClientRect();if(!r)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(!drag.current.moved&&(Math.abs(dx)>6||Math.abs(dy)>6))drag.current.moved=true;if(drag.current.moved)onMove({x:Math.max(0,Math.min(92,drag.current.ox+dx/r.width*100)),y:Math.max(0,Math.min(88,drag.current.oy+dy/r.height*100))})}} onPointerUp={e=>{const wasMoved=drag.current?.moved;const target=(document.elementFromPoint(e.clientX,e.clientY) as HTMLElement|null)?.closest('[data-drop-folder]')?.getAttribute('data-drop-folder');drag.current=null;if(wasMoved&&target){onDropTarget(target)}else if(!wasMoved)onSelect();if((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId))(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)}} onDoubleClick={e=>{e.preventDefault();onOpen()}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY)}}><span className="desktop-file-icon tone-blue">{file.kind==='note'?<FileText size={30}/>:file.mime?.startsWith('image/')?<SunMedium size={30}/>:file.mime?.startsWith('video/')?<Play size={30}/>:<Folder size={30}/>}</span><span className="desktop-file-name" title={file.name}>{file.name}</span></button>}

function DaFileExplorer({folder,setFolder,files,folders,folderApps,apps,desktopApps,onImport,onNewFile,onNewFolder,onNewNote,onMoveFile,onMoveApp,onEditFile,onOpen,onOpenApp,onCopy,onCut,onPaste,onDelete,onAddDesktop,onContext,openFileId,setOpenFileId,explorerPositions,onExplorerMove}:{folder:ExplorerFolder;setFolder:(f:ExplorerFolder)=>void;files:UserFile[];folders:UserFolder[];folderApps:Record<string,string[]>;apps:AppItem[];desktopApps:string[];onImport:(f:FileList|null,l:'Pictures'|'Videos')=>void;onNewFile:(l?:string)=>void;onNewFolder:(l?:string)=>void;onNewNote:(l?:string)=>void;onMoveFile:(id:string,location:string)=>void;onMoveApp:(id:string,location:string)=>void;onEditFile:(id:string,data:string)=>void;onOpen:(f:UserFile)=>void;onOpenApp:(a:AppItem)=>void;onCopy:(type:'app'|'file'|'folder',id:string)=>void;onCut:(type:'app'|'file'|'folder',id:string)=>void;onPaste:()=>void;onDelete:(type:'app'|'file'|'folder',id:string)=>void;onAddDesktop:(id:string)=>void;onContext:(x:number,y:number,item:{app?:AppItem;file?:UserFile;folderItem?:UserFolder})=>void;openFileId:string|null;setOpenFileId:(id:string|null)=>void;explorerPositions:Record<string,number>;onExplorerMove:(id:string,y:number)=>void}){const roots:[string,string][]=[['Home','Home'],['Desktop','Desktop'],['Pictures','Photos'],['Music','Music'],['Videos','Videos']];const folderFiles=files.filter(f=>f.location===folder);const childFolders=folders.filter(f=>f.parent===folder);const appNames=folder==='Desktop'?desktopApps:(folderApps[folder]||[]);const appItems=appNames.map(n=>{const base=n.split('::')[0];const a=apps.find(x=>x.name===base);return a?{...a,name:n}:undefined}).filter(Boolean) as AppItem[];const openFile=openFileId?files.find(f=>f.id===openFileId):undefined;const [history,setHistory]=useState<string[]>([]);const navigate=(next:string)=>{if(next===folder)return;setHistory(h=>[...h,folder]);setOpenFileId(null);setFolder(next)};const goBack=()=>{const previous=history[history.length-1];if(!previous)return;setHistory(h=>h.slice(0,-1));setOpenFileId(null);setFolder(previous)};const title=roots.find(r=>r[0]===folder)?.[1]||folders.find(f=>f.id===folder)?.name||files.find(f=>f.id===folder)?.name||folder;return <div className="explorer-shell"><aside className="explorer-sidebar"><div className="explorer-brand"><Folder size={20}/><strong>DaFile Explorer</strong></div>{roots.map(([name,label])=><button key={name} className={folder===name?'active':''} onClick={()=>navigate(name)}>{name==='Home'?<Folder/>:name==='Desktop'?<Sparkles/>:name==='Pictures'?<SunMedium/>:name==='Music'?<Music2/>:<Play/>}<span>{label}</span></button>)}</aside><section className="explorer-main" onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{})}} onDragOver={e=>{if(e.dataTransfer.types.length)e.preventDefault()}} onDrop={e=>{e.preventDefault();const yId=e.dataTransfer.getData('ida-y-id');if(yId){const grid=e.currentTarget.querySelector('.explorer-grid');const rect=grid?.getBoundingClientRect();if(rect)onExplorerMove(yId,Math.max(0,Math.round((e.clientY-rect.top)/58)));return}const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id){if(type==='app')onMoveApp(id,folder==='Home'?'Desktop':folder);else if(type==='file'&&folder!=='Home')onMoveFile(id,folder);else if(type==='folder'&&folder!=='Home'&&id!==folder)onMoveFile(id,folder)}}}><div className="explorer-toolbar"><div className="explorer-nav"><button className="explorer-back" onClick={goBack} disabled={!history.length} aria-label="Back">‹</button><div><span className="eyebrow">IDA</span><h2>{title}</h2></div></div><div className="explorer-actions">{folder==='Pictures'&&<label className="explorer-upload"><Download size={15}/>Add pictures<input type="file" multiple accept="image/*" onChange={e=>onImport(e.target.files,'Pictures')}/></label>}{folder==='Videos'&&<label className="explorer-upload"><Download size={15}/>Add videos<input type="file" multiple accept="video/*" onChange={e=>onImport(e.target.files,'Videos')}/></label>}</div></div>{openFile?<div className="explorer-file-view" onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{file:openFile})}}><button onClick={()=>setOpenFileId(null)}>‹ Back to {title}</button><div className="explorer-file-header"><FileText size={26}/><strong>{openFile.name}</strong></div><textarea value={openFile.data||''} onChange={e=>onEditFile(openFile.id,e.target.value)} placeholder="Start writing in this file..."/></div>:folder==='Home'?<div className="explorer-grid">{roots.slice(1).map(([name,label])=><button key={name} className="explorer-card" onDoubleClick={()=>navigate(name)}><span className="explorer-card-icon"><Folder size={28}/></span><strong>{label}</strong><small>{files.filter(f=>f.location===name).length+(name==='Desktop'?apps.length:0)+folders.filter(f=>f.parent===name).length} items</small></button>)}{folders.filter(f=>f.parent==='Home').map(d=><button key={d.id} data-drop-folder={d.id} className="explorer-card file-card" onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move'}} onDrop={e=>{e.preventDefault();e.stopPropagation();const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id&&type==='app')onMoveApp(id,d.id);else if(id&&type==='file')onMoveFile(id,d.id);else if(id&&type==='folder'&&id!==d.id)onMoveFile(id,d.id)}} onDoubleClick={()=>navigate(d.id)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{folderItem:d})}}><span className="explorer-card-icon tone-blue"><Folder size={28}/></span><strong>{d.name}</strong><small>Folder</small></button>)}</div>:<div className="explorer-grid">{childFolders.map(d=><button key={d.id} data-drop-folder={d.id} draggable onDragOver={e=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='move'}} onDrop={e=>{e.preventDefault();e.stopPropagation();const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id&&type==='app')onMoveApp(id,d.id);else if(id&&type==='file')onMoveFile(id,d.id);else if(id&&type==='folder'&&id!==d.id)onMoveFile(id,d.id)}} onDragStart={e=>{e.dataTransfer.setData('ida-y-id',d.id);e.dataTransfer.setData('ida-type','folder');e.dataTransfer.setData('ida-id',d.id);e.dataTransfer.effectAllowed='move'}} style={{order:explorerPositions[d.id]??0}} className="explorer-card file-card" onDoubleClick={()=>navigate(d.id)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{folderItem:d})}}><span className="explorer-card-icon"><Folder size={28}/></span><strong>{d.name}</strong><small>Folder</small></button>)}{appItems.map(a=><button key={a.name} draggable onDragStart={e=>{e.dataTransfer.setData('ida-y-id','app:'+a.name);e.dataTransfer.setData('ida-type','app');e.dataTransfer.setData('ida-id',a.name);e.dataTransfer.setData('ida-app',a.name);e.dataTransfer.effectAllowed='copyMove'}} style={{order:explorerPositions['app:'+a.name]??0}} className="explorer-card file-card" onDoubleClick={()=>onOpenApp(a)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{app:a})}}><span className={'explorer-card-icon explorer-app-icon tone-'+a.tone}>{<IdaAppIcon name={a.name} size={28}/>}</span><strong>{a.name}</strong><small>App</small></button>)}{folderFiles.map(f=><button key={f.id} data-drop-folder={f.id} draggable onDragOver={e=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='move'}} onDrop={e=>{e.preventDefault();e.stopPropagation();const type=e.dataTransfer.getData('ida-type') as 'app'|'file'|'folder';const id=e.dataTransfer.getData('ida-id')||e.dataTransfer.getData('ida-app')||e.dataTransfer.getData('ida-file');if(id&&type==='app')onMoveApp(id,f.id);else if(id&&type==='file'&&id!==f.id)onMoveFile(id,f.id);else if(id&&type==='folder'&&id!==f.id)onMoveFile(id,f.id)}} onDragStart={e=>{e.dataTransfer.setData('ida-y-id',f.id);e.dataTransfer.setData('ida-type','file');e.dataTransfer.setData('ida-id',f.id);e.dataTransfer.setData('ida-file',f.id);e.dataTransfer.effectAllowed='copyMove'}} style={{order:explorerPositions[f.id]??0}} className="explorer-card file-card" onDoubleClick={()=>{if(f.mime==='text/plain'){setOpenFileId(f.id)}else onOpen(f)}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContext(e.clientX,e.clientY,{file:f})}}><span className="explorer-card-icon">{f.kind==='note'?<FileText size={27}/>:f.mime?.startsWith('image/')?<SunMedium size={27}/>:f.mime?.startsWith('video/')?<Play size={27}/>:<Folder size={27}/>}</span><strong>{f.name}</strong><small>{f.kind==='note'?'Note':f.mime||'File'}</small></button>)}</div>}</section></div>}

function DaNotes({files,notes,updateNotes,onNewNote,onDeleteNote,fileId}:{files:UserFile[];notes:Record<string,string>;updateNotes:(n:Record<string,string>)=>void;onNewNote:()=>string;onDeleteNote:(id:string)=>void;fileId?:string}){const noteIds=files.filter(f=>f.kind==='note');const [active,setActive]=useState(fileId||noteIds[0]?.id||'');useEffect(()=>{if(!noteIds.some(f=>f.id===active))setActive(noteIds[0]?.id||'')},[noteIds.map(f=>f.id).join('|')]);const text=notes[active]||'';return <div className="notes-shell"><aside className="notes-sidebar"><div className="notes-brand"><FileText size={20}/><strong>DaNotes</strong></div><button className="notes-new" onClick={()=>setActive(onNewNote())}>＋ New note</button>{noteIds.map(f=><div key={f.id} className={'notes-item '+(active===f.id?'active':'')}><button onClick={()=>setActive(f.id)}>{f.name}</button><button className="notes-delete" onClick={()=>onDeleteNote(f.id)} aria-label={'Delete '+f.name}><X size={14}/></button></div>)}</aside><section className="notes-main">{active?<><div className="notes-title-row"><input className="notes-title" value={noteIds.find(f=>f.id===active)?.name||'New Note'} readOnly/><button className="notes-delete-main" onClick={()=>onDeleteNote(active)} aria-label="Delete note"><X size={16}/></button></div><textarea value={text} onChange={e=>updateNotes({...notes,[active]:e.target.value})} placeholder="Start writing..."/></>:<div className="explorer-empty"><FileText size={34}/><strong>No notes yet</strong><span>Click New note to create your first note.</span></div>}</section></div>}

function RenameDialog({value,onChange,onCancel,onSave}:{value:string;onChange:(s:string)=>void;onCancel:()=>void;onSave:()=>void}){return <div className="rename-backdrop" onPointerDown={onCancel}><div className="rename-dialog" onPointerDown={e=>e.stopPropagation()}><strong>Rename</strong><input autoFocus value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')onSave();if(e.key==='Escape')onCancel()}}/><div><button onClick={onCancel}>Cancel</button><button className="rename-save" onClick={onSave}>Rename</button></div></div></div>}
function DesktopContextMenu({menu,taskbarApps,clipboard,onAdd,onRemove,onRefresh,onNewFolder,onNewNote,onOpen,onOpenFile,onOpenFolder,onRename,onSettings,onCopy,onCut,onPaste,onDelete}:{menu:{x:number;y:number;scope:'desktop'|'explorer'|'window';app?:AppItem;file?:UserFile;folderItem?:UserFolder;folder?:ExplorerFolder};taskbarApps:string[];clipboard:{type:'app'|'file'|'folder';id:string;mode:'copy'|'cut'}|null;onAdd:(n:string)=>void;onRemove:(n:string)=>void;onRefresh:()=>void;onNewFolder:(location?:ExplorerFolder)=>void;onNewNote:(location?:ExplorerFolder)=>void;onOpen:(a:AppItem)=>void;onOpenFile:(f:UserFile)=>void;onOpenFolder:(f:UserFolder)=>void;onRename:(v:{type:'app'|'file'|'folder';id:string;name:string})=>void;onSettings:()=>void;onCopy:(type:'app'|'file'|'folder',id:string)=>void;onCut:(type:'app'|'file'|'folder',id:string)=>void;onPaste:()=>void;onDelete:(type:'app'|'file'|'folder',id:string)=>void}){const a=menu.app;const f=menu.file;const sf=menu.folderItem;return <div className="desktop-context" style={{left:Math.min(menu.x,window.innerWidth-245),top:Math.min(menu.y,window.innerHeight-300),zIndex:2147483646}} onPointerDown={e=>e.stopPropagation()}>{(a||f||sf)&&<button onClick={()=>a?onOpen(a):f?onOpenFile(f):sf?onOpenFolder(sf):undefined}><Play size={14}/> {a?'Open app':f?'Open':'Open File'}</button>}{(a||f||sf)&&<button onClick={()=>onRename(a?{type:'app',id:a!.name,name:a!.name}:f?{type:'file',id:f!.id,name:f!.name}:{type:'folder',id:sf!.id,name:sf!.name})}><Settings2 size={14}/> Rename</button>}{(a||f||sf)&&<><button onClick={()=>onCopy(a?'app':f?'file':'folder',a?.name||f?.id||sf!.id)}><Clipboard size={14}/> Copy</button><button onClick={()=>onCut(a?'app':f?'file':'folder',a?.name||f?.id||sf!.id)}><Scissors size={14}/> Cut</button></>}{a&&(taskbarApps.includes(a.name)?<button onClick={()=>onRemove(a.name)}><Minus size={14}/> Remove from taskbar</button>:<button onClick={()=>onAdd(a.name)}>＋ Add to taskbar</button>)} {(a||f||sf)&&<button onClick={()=>onDelete(a?'app':f?'file':'folder',a?.name||f?.id||sf!.id)}><X size={14}/> Delete</button>}{!a&&!f&&!sf&&menu.scope==='desktop'&&<button onClick={onRefresh}><Sparkles size={14}/> Refresh</button>} {menu.folder&&<div className="new-menu-wrap"><button><Folder size={14}/> New <ChevronDown size={14} className="new-chevron"/></button><div className="new-submenu"><button onClick={()=>onNewFolder(menu.folder)}><Folder size={14}/> New Folder</button><button onClick={()=>onNewNote(menu.folder)}><FileText size={14}/> New Note</button></div></div>} {clipboard&&menu.folder&&<button onClick={onPaste}><Clipboard size={14}/> Paste</button>} {!a&&!f&&menu.folder==='Desktop'&&<button onClick={onSettings}><Gear size={14}/> IDA settings</button>}</div>}
function NativeWindowContextMenu({menu,onMinimize,onClose}:{menu:{x:number;y:number;scope:'desktop'|'explorer'|'window';windowKey?:string};onMinimize:()=>void;onClose:()=>void}){return <div className="desktop-context taskbar-context" style={{left:Math.min(menu.x,window.innerWidth-205),top:Math.min(menu.y,window.innerHeight-145)}} onPointerDown={e=>e.stopPropagation()}><button onClick={onMinimize}><Minus size={14}/> Minimize</button><button onClick={onClose}><X size={14}/> Close</button></div>}
function TaskbarContextMenu({menu,onRemove,onOpen,onClose}:{menu:{x:number;y:number;name:string;key?:string;running?:boolean};onRemove:()=>void;onOpen:()=>void;onClose:()=>void}){const running=!!menu.running;return <div className="desktop-context taskbar-context" style={{left:Math.min(menu.x,window.innerWidth-205),top:Math.min(menu.y,window.innerHeight-125),zIndex:100001}} onPointerDown={e=>e.stopPropagation()}><button onClick={onOpen}><Play size={14}/> Open app</button>{running&&<button onClick={onClose}><X size={14}/> Close app</button>}{!running&&<button onClick={onRemove}><Minus size={14}/> Remove from taskbar</button>}<button onClick={onClose}>Cancel</button></div>}