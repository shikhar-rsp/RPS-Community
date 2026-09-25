import Link from 'next/link';
import styles from './registrations/registrations.module.css';

/* The two admin lists, one click apart. Both pages sit behind the same
   allow-list, so a link here never leads anywhere the viewer can't open. */
const TABS = [
  ['registrations', '/admin/registrations', 'Workshop registrations'],
  ['logins', '/admin/logins', 'Logins'],
];

export default function AdminTabs({ current }) {
  return (
    <nav className={styles.tabs} aria-label="Admin lists">
      {TABS.map(([key, href, label]) => (
        <Link
          key={key}
          href={href}
          className={styles.tab}
          aria-current={current === key ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
