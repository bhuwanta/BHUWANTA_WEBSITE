import { homeSchema } from './home'
import { aboutSchema } from './about'
import { gallerySchema } from './gallery'
import { projectsSchema } from './projects'
import { blogSchema } from './blog'
import { careersSchema } from './careers'
import { contactSchema } from './contact'
import { jobListingSchema } from './jobListing'
import { siteSettingsSchema } from './siteSettings'
import { autoresponderSchema } from './autoresponder'
import { leadSchema } from './lead'

export const schemaTypes = [
  siteSettingsSchema,
  autoresponderSchema,
  leadSchema,
  homeSchema,
  aboutSchema,
  gallerySchema,
  projectsSchema,
  blogSchema,
  careersSchema,
  contactSchema,
  jobListingSchema,
]
