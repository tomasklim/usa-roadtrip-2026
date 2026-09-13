import { PHOTOS } from "./DayParts";

const licenseLink = (license: string) => {
  const cc = /^CC (BY(?:-SA)?) ([0-9.]+)$/.exec(license);
  return cc ? `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}/`
    : license === "CC0" ? "https://creativecommons.org/publicdomain/zero/1.0/" : undefined;
};

export function PhotoCredits() {
  return <div className="wrap view-content credits-view">
    <div className="section-heading"><div><span className="eyebrow">BEHIND THE PHOTOGRAPHS</span><h1>Photo credits.</h1></div></div>
    <p className="credits-intro">Thank you to the photographers who shared these views. Images are cropped to fit the layouts. Some show optional stops or the surrounding area; the daily plan describes the route.</p>
    <ul className="credits-list">{Object.entries(PHOTOS).sort(([, a], [, b]) => (a.label ?? a.alt).localeCompare(b.label ?? b.alt)).map(([id, photo]) =>
      <li key={id} id={`photo-${id}`}>
        <a href={photo.page} target="_blank" rel="noreferrer noopener">{photo.label ?? photo.alt} ↗</a>
        <p>{photo.alt}</p>
        <span>{photo.credit} · {licenseLink(photo.license)
          ? <a href={licenseLink(photo.license)} target="_blank" rel="noreferrer noopener">{photo.license}</a>
          : photo.license}</span>
      </li>
    )}</ul>
  </div>;
}
