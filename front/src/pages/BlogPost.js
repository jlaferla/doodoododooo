// src/pages/BlogPost.js
import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { blogPosts, getPost } from '../blogPosts';
import './Blog.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// Simple markdown-lite renderer: ## headings, **bold**, bullet lists, blank lines → paragraphs
function renderContent(text) {
  const lines = text.trim().split('\n');
  const elements = [];
  let i = 0;
  let keyIdx = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // H2
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={keyIdx++} className="bp-h2">{line.slice(3)}</h2>
      );
      i++;
      continue;
    }

    // Bullet list block
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={keyIdx++} className="bp-list">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-heading, non-list lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('## ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ')
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      const text = paraLines.join(' ');
      elements.push(
        <p key={keyIdx++} className="bp-p">{renderInline(text)}</p>
      );
    }
  }

  return elements;
}

function renderInline(text) {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const currentIdx = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIdx > 0 ? blogPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < blogPosts.length - 1 ? blogPosts[currentIdx + 1] : null;

  return (
    <div className="bp-page">
      {/* Back to blog */}
      <div className="bp-topbar">
        <Link to="/blog" className="bp-back">← All articles</Link>
        <span className="bp-series-tag">FX Explained</span>
      </div>

      <article className="bp-article">
        {/* Hero */}
        <header className="bp-header">
          <div className="bp-num-badge">#{post.number} of {blogPosts.length}</div>
          <h1 className="bp-title">{post.title}</h1>
          <p className="bp-subtitle">{post.subtitle}</p>
          <div className="bp-meta">
            <span>{formatDate(post.date)}</span>
            <span className="bp-meta-dot">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Content */}
        <div className="bp-body">
          {renderContent(post.content)}
        </div>

        {/* FX Ping CTA */}
        <div className="bp-cta-box">
          <div className="bp-cta-text">
            <strong>See it in action</strong>
            <span>Check live mid-market rates, model FX margin, and explore historical charts — free, no sign-up.</span>
          </div>
          <Link to="/" className="bp-cta-btn">Open FX Ping →</Link>
        </div>

        {/* Series nav */}
        <nav className="bp-series-nav">
          <div className="bp-series-nav-label">Continue reading</div>
          <div className="bp-series-nav-links">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="bp-nav-link bp-nav-prev">
                <span className="bp-nav-dir">← Previous</span>
                <span className="bp-nav-title">{prevPost.title}</span>
              </Link>
            ) : <div />}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="bp-nav-link bp-nav-next">
                <span className="bp-nav-dir">Next →</span>
                <span className="bp-nav-title">{nextPost.title}</span>
              </Link>
            ) : <div />}
          </div>
        </nav>
      </article>

      {/* All posts */}
      <div className="bp-all-posts">
        <div className="bp-all-posts-label">All articles in this series</div>
        <div className="bp-all-posts-grid">
          {blogPosts.map(p => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className={`bp-all-item ${p.slug === slug ? 'bp-all-item-active' : ''}`}
            >
              <span className="bp-all-num">#{p.number}</span>
              <span className="bp-all-title">{p.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}