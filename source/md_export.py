#!/usr/bin/env python3
"""Emit an agent-friendly hierarchical Markdown tree (llms.txt, llms-full.txt, book/overview.md,
book/chNN-<slug>.md, and book/chNN/<sec>.md) alongside the static web book output."""
import os
import re


def _slugify(raw: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', str(raw or '').lower()).strip('-')
    return s or 'section'


def _strip_directives(src: str) -> str:
    lines = []
    in_fence = False
    for line in str(src or '').splitlines():
        stripped = line.strip()
        if stripped.startswith(':::figure'):
            in_fence = True
            title = stripped[len(':::figure'):].strip()
            if title:
                lines.append(f'> [Figure] {title}')
            continue
        if stripped.startswith(':::'):
            if stripped == ':::' and in_fence:
                in_fence = False
            continue
        if in_fence:
            if stripped:
                lines.append(f'> {stripped}')
            continue
        lines.append(line)
    out = '\n'.join(lines)
    out = re.sub(r'<[^>]+>', '', out)
    out = re.sub(r'\n{3,}', '\n\n', out)
    return out.strip()


def _base_link(base_url: str, rel_path: str) -> str:
    clean = str(base_url or '').strip().rstrip('/')
    return f'{clean}/{rel_path}' if clean else rel_path


def export_markdown_tree(site_dir, title, subtitle, site_url, description, chapters):
    """Write llms.txt, llms-full.txt, book/overview.md, and chapter/section Markdown files."""
    book_dir = os.path.join(site_dir, 'book')
    os.makedirs(book_dir, exist_ok=True)
    sorted_chapters = sorted(chapters, key=lambda c: c.n)

    full_parts = [
        f'# {title}\n\n> {subtitle or description}\n\n_Canonical Markdown edition for readers and tools._'
    ]
    llms_lines = [
        f'# {title}',
        '',
        f'> {subtitle or description}',
        '',
        f'- [Book Overview & Reader Contract]({_base_link(site_url, "book/overview.md")})',
        '',
        '## Chapters',
        '',
    ]
    overview_lines = [
        f'# {title} — Overview & Reader Contract',
        '',
        subtitle or description,
        '',
        '## What Stays Fixed vs. What Evolves',
        '',
        '- **What stays fixed:** Core invariants, causal mechanisms, conservation laws, and reasoning checks.',
        '- **What may evolve:** Experimental data values, interactive examples, and companion references.',
        '',
        '## Chapter Map',
        '',
    ]

    for ch in sorted_chapters:
        ch_folder = f'ch{ch.n:02d}'
        ch_slug = _slugify(getattr(ch, 'short', None) or ch.title)
        ch_rel = f'book/{ch_folder}-{ch_slug}.md'
        sec_dir = os.path.join(book_dir, ch_folder)
        os.makedirs(sec_dir, exist_ok=True)

        ch_lines = [f'# Chapter {ch.n}: {ch.title}', '']
        if getattr(ch, 'question', ''):
            ch_lines.extend([f'> Big Question: {ch.question}', ''])
        intro_md = _strip_directives(getattr(ch, 'intro_src', ''))
        if intro_md:
            ch_lines.extend([intro_md, ''])

        numbered = [(n, t, body) for n, t, body in ch.sections if n]
        if numbered:
            ch_lines.extend(['## Sections', ''])
            for n, t, body in numbered:
                sec_slug = _slugify(f'{n}-{t}')
                sec_rel = f'book/{ch_folder}/{sec_slug}.md'
                sec_md = _strip_directives(body)
                sec_doc = [
                    f'# {n} {t}',
                    '',
                    f'_Chapter {ch.n}: {ch.title}_',
                    '',
                    sec_md,
                    '',
                    f'[Back to Chapter {ch.n}](../{ch_folder}-{ch_slug}.md) · [Index]({ _base_link(site_url, "llms.txt") })',
                    '',
                ]
                with open(os.path.join(site_dir, sec_rel), 'w', encoding='utf-8') as f:
                    f.write('\n'.join(sec_doc))
                ch_lines.append(f'- [{n} {t}](./{ch_folder}/{sec_slug}.md)')
            ch_lines.append('')

        for n, t, body in ch.sections:
            heading = f'## {n} {t}' if n else f'## {t}'
            body_md = _strip_directives(body)
            ch_lines.extend([heading, '', body_md, ''])

        ch_md_text = '\n'.join(ch_lines).strip() + '\n'
        with open(os.path.join(site_dir, ch_rel), 'w', encoding='utf-8') as f:
            f.write(ch_md_text)

        full_parts.append(ch_md_text)
        llms_lines.append(f'- [Chapter {ch.n}: {ch.title}]({_base_link(site_url, ch_rel)})')
        for n, t, _ in numbered:
            sec_slug = _slugify(f'{n}-{t}')
            llms_lines.append(f'  - [{n} {t}]({_base_link(site_url, f"book/{ch_folder}/{sec_slug}.md")})')
        overview_lines.append(f'### Chapter {ch.n}: {ch.title}')
        if getattr(ch, 'question', ''):
            overview_lines.append(f'> {ch.question}')
        overview_lines.append(f'- Read chapter: [{ch_rel}]({_base_link(site_url, ch_rel)})')
        overview_lines.append('')

    full_text = '\n\n---\n\n'.join(full_parts).strip() + '\n'
    with open(os.path.join(site_dir, 'llms-full.txt'), 'w', encoding='utf-8') as f:
        f.write(full_text)

    with open(os.path.join(site_dir, 'book', 'overview.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(overview_lines))

    llms_lines.extend([
        '',
        '## Full Text Bundle',
        '',
        f'- [Complete book (llms-full.txt)]({_base_link(site_url, "llms-full.txt")})',
        '',
    ])
    with open(os.path.join(site_dir, 'llms.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(llms_lines))
