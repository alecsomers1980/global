import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Credits',
  description:
    'Photography attribution for licensed works used on the Kruger Panorama Experience website.',
};

const CREDITS = [
  {
    file: 'Home hero',
    artist: 'Mike and Lara Wolfe',
    licence: 'CC0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Safari hero',
    artist: 'Entropy1963',
    licence: 'Public domain',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Tours hero',
    artist: 'Dietmar Rabich',
    licence: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Transfers hero',
    artist: 'South African Tourism',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Accommodation hero',
    artist: 'Hendrik van den Berg',
    licence: 'CC BY 3.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'eSwatini',
    artist: 'nklette',
    licence: 'CC BY 3.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Mozambique',
    artist: 'kevincure',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Local experiences',
    artist: 'South African Tourism',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Johannesburg',
    artist: 'Evan Bench',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Family experiences',
    artist: 'Entropy1963',
    licence: 'Public domain',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Adventure experiences',
    artist: 'South African Tourism',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'Panorama Route tours',
    artist: 'South African Tourism',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
  {
    file: 'OR Tambo transfer',
    artist: 'South African Tourism',
    licence: 'CC BY 2.0',
    source: 'https://commons.wikimedia.org/',
  },
];

export default function ImageCreditsPage() {
  return (
    <section className="container-kpe py-20">
      <h1 className="mb-6 text-3xl font-bold">Image Credits</h1>
      <p className="mb-4 text-text/70">
        Some of the photography on this site is used under Creative Commons licences
        that require visible attribution. The credits below satisfy that requirement.
      </p>
      <p className="mb-8 text-text/70">
        Photographs supplied by the operator are used with permission and are not
        listed here.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-ink/15 py-3 text-left text-xs uppercase tracking-wide3 text-text/70">
                File / Use
              </th>
              <th className="border-b border-ink/15 py-3 text-left text-xs uppercase tracking-wide3 text-text/70">
                Artist
              </th>
              <th className="border-b border-ink/15 py-3 text-left text-xs uppercase tracking-wide3 text-text/70">
                Licence
              </th>
              <th className="border-b border-ink/15 py-3 text-left text-xs uppercase tracking-wide3 text-text/70">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {CREDITS.map((credit) => (
              <tr key={credit.file}>
                <td className="border-b border-ink/10 py-3 pr-6 normal-case text-text/70">
                  {credit.file}
                </td>
                <td className="border-b border-ink/10 py-3 pr-6 normal-case text-text/70">
                  {credit.artist}
                </td>
                <td className="border-b border-ink/10 py-3 pr-6 normal-case text-text/70">
                  {credit.licence}
                </td>
                <td className="border-b border-ink/10 py-3 pr-6 normal-case text-text/70">
                  <a
                    href={credit.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-text-text"
                  >
                    {credit.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
