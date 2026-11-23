import { supportedRoles } from '@pharmacy-two/shared';

export const App = (): JSX.Element => (
  <main className="app-shell">
    <a className="skip-link" href="#workspace">
      Skip to workspace
    </a>
    <header className="topbar">
      <div>
        <p className="eyebrow">PharmacyTwo</p>
        <h1>Clinical operations workspace</h1>
      </div>
      <button className="theme-toggle" type="button" aria-label="Toggle theme">
        T
      </button>
    </header>
    <div className="layout">
      <nav className="side-nav" aria-label="Primary">
        {supportedRoles.map((role) => (
          <a key={role.id} href={`#${role.id}`}>
            {role.label}
          </a>
        ))}
      </nav>
      <section id="workspace" className="workspace" aria-labelledby="workspace-title">
        <h2 id="workspace-title">Role-aware access foundation</h2>
        <p>
          Shared role models are available to the frontend and backend through the
          workspace package graph.
        </p>
      </section>
    </div>
  </main>
);
