const fs = require('fs');
let code = fs.readFileSync('frontend/components/layout/Header.tsx', 'utf8');

// 1. Imports
code = code.replace(
  'import { useAuth } from \'@/lib/AuthContext\';',
  'import { useAuth } from \'@/lib/AuthContext\';\nimport api from \'@/lib/api\';\nimport { Notification } from \'@/types\';'
);

// 2. State & Hooks
const hooksInsertion = \  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    api.get('/notifications')
      .then(res => setNotifications(res.data.notifications || []))
      .catch(console.error);

    const handleGlobalNotification = (e) => {
      const data = (e as CustomEvent).detail;
      setNotifications(prev => [data, ...prev].slice(0, 200));
      setToastMessage(data.message);
      setTimeout(() => setToastMessage(null), 3000);
    };

    window.addEventListener('globalNotification', handleGlobalNotification as EventListener);
    return () => window.removeEventListener('globalNotification', handleGlobalNotification as EventListener);
  }, [currentUser]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.put(\\\/notifications/\/read\\\);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      } catch (e) { console.error(e); }
    }
  };\;

code = code.replace(
  '  const searchRef = useRef<HTMLDivElement>(null);',
  hooksInsertion + '\n\n  const searchRef = useRef<HTMLDivElement>(null);'
);

// 3. Update the JSX for notifications
code = code.replace('mockNotifications.some', 'notifications.some');
code = code.replace('mockNotifications.length > 0', 'notifications.length > 0');
code = code.replace('mockNotifications.map(notification', 'notifications.map(notification');
code = code.replace('<button className="text-[12px] font-semibold text-theme-cobalt hover:underline">Mark all as read</button>', '<button onClick={handleMarkAllAsRead} className="text-[12px] font-semibold text-theme-cobalt hover:underline">Mark all as read</button>');

// 4. Update the onClick for individual notification
code = code.replace('className=\p-4 border-b border-theme-border/50 hover:bg-[#F8FAFC] transition-colors cursor-pointer \\', 'onClick={() => handleNotificationClick(notification)}\n                        className=\p-4 border-b border-theme-border/50 hover:bg-[#F8FAFC] transition-colors cursor-pointer \\');

// 5. Add Toast at the end
code = code.replace('</header>', \
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-theme-charcoal text-white px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-theme-coral animate-pulse"></div>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </header>\);

fs.writeFileSync('frontend/components/layout/Header.tsx', code);
console.log('Header updated successfully.');
const fs = require('fs');
// Clear the previous content
fs.writeFileSync('script.js', '');
