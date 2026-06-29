import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { IANATimeZone } from "@/types/content.types";
import { IconName } from "@/resources/icons";
import { Line, Row, Text } from "@once-ui-system/core";
import data from "./content.data.json";

// ---------------------------------------------------------------------------
// content.tsx is a THIN RENDERER over content.data.json.
// All editable copy lives in content.data.json (edited via the /admin CMS).
// This file only re-assembles the typed objects the template expects, wrapping
// plain strings in fragments where a React.ReactNode is required and keeping
// every derived/structural value computed here. The rendered output is meant
// to be identical to the original hand-written content.tsx.
// ---------------------------------------------------------------------------

// Replace {firstName} / {email} tokens so the JSON stays a single source of truth.
const interp = (s: string): string =>
  s.replace(/\{firstName\}/g, data.person.firstName).replace(/\{email\}/g, data.person.email);

const person: Person = {
  firstName: data.person.firstName,
  lastName: data.person.lastName,
  name: data.person.name,
  role: data.person.role,
  avatar: data.person.avatar,
  email: data.person.email,
  location: data.person.location as IANATimeZone, // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: data.person.languages, // optional: Leave the array empty if you don't want to display languages
  locale: data.person.locale, // BCP 47 language tag for the HTML lang attribute, e.g., 'en', 'ja', 'zh-TW'
};

const newsletter: Newsletter = {
  display: data.newsletter.display,
  title: <>{interp(data.newsletter.title)}</>,
  description: <>{interp(data.newsletter.description)}</>,
};

const social: Social = data.social.map((s) => ({
  name: s.name,
  icon: s.icon as IconName,
  link: interp(s.link),
  essential: s.essential,
}));

const home: Home = {
  path: "/",
  image: data.home.image,
  label: data.home.label,
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>{data.home.headline}</>,
  featured: {
    display: data.home.featured.display,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">{data.home.featured.label}</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          {data.home.featured.tag}
        </Text>
      </Row>
    ),
    href: data.home.featured.href,
  },
  subline: <>{data.home.subline}</>,
};

const about: About = {
  path: "/about",
  label: data.about.label,
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role}`,
  tableOfContent: data.about.tableOfContent,
  avatar: data.about.avatar,
  calendar: data.about.calendar,
  intro: {
    display: data.about.intro.display,
    title: data.about.intro.title,
    description: <>{data.about.intro.description}</>,
  },
  work: {
    display: data.about.work.display,
    title: data.about.work.title,
    experiences: data.about.work.experiences.map((exp) => ({
      company: exp.company,
      timeframe: exp.timeframe,
      role: exp.role,
      achievements: exp.achievements,
      images: exp.images,
    })),
  },
  studies: {
    display: data.about.studies.display,
    title: data.about.studies.title,
    institutions: data.about.studies.institutions.map((inst) => ({
      name: inst.name,
      description: <>{inst.description}</>,
    })),
  },
  technical: {
    display: data.about.technical.display,
    title: data.about.technical.title,
    skills: data.about.technical.skills.map((skill) => ({
      title: skill.title,
      description: <>{skill.description}</>,
      tags: skill.tags,
      images: skill.images,
    })),
  },
};

const blog: Blog = {
  path: "/blog",
  label: data.blog.label,
  title: data.blog.title,
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: data.work.label,
  title: `Projects – ${person.name}`,
  description: `Cybersecurity, networking, and machine learning projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/work/projects
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: data.gallery.label,
  title: `Photo gallery – ${person.name}`,
  description: `Dokumentasi praktikum, bootcamp, dan kegiatan oleh ${person.name}`,
  images: data.gallery.images,
};

export { person, social, newsletter, home, about, blog, work, gallery };
