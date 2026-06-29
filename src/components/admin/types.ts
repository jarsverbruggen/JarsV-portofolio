// Shape of src/resources/content.data.json, used by the admin forms.

export interface Tag {
  name: string;
  icon?: string;
}

export interface Experience {
  company: string;
  timeframe: string;
  role: string;
  achievements: string[];
  images: string[];
}

export interface Institution {
  name: string;
  description: string;
}

export interface Skill {
  title: string;
  description: string;
  tags: Tag[];
  images: string[];
}

export interface SocialLink {
  name: string;
  icon: string;
  link: string;
  essential: boolean;
}

export interface GalleryImage {
  src: string;
  alt: string;
  orientation: string;
}

export interface ContentData {
  person: {
    firstName: string;
    lastName: string;
    name: string;
    role: string;
    avatar: string;
    email: string;
    location: string;
    languages: string[];
    locale: string;
  };
  newsletter: {
    display: boolean;
    title: string;
    description: string;
  };
  social: SocialLink[];
  home: {
    image: string;
    label: string;
    headline: string;
    subline: string;
    featured: {
      display: boolean;
      label: string;
      tag: string;
      href: string;
    };
  };
  about: {
    label: string;
    tableOfContent: { display: boolean; subItems: boolean };
    avatar: { display: boolean };
    calendar: { display: boolean; link: string };
    intro: { display: boolean; title: string; description: string };
    work: { display: boolean; title: string; experiences: Experience[] };
    studies: { display: boolean; title: string; institutions: Institution[] };
    technical: { display: boolean; title: string; skills: Skill[] };
  };
  blog: { label: string; title: string };
  work: { label: string };
  gallery: { label: string; images: GalleryImage[] };
}

export interface MdxEntry {
  slug: string;
  metadata: Record<string, unknown>;
  content: string;
}
