import { homeSchema } from './home'
import { aboutSchema } from './about'

import { projectsSchema } from './projects'
import { blogSchema } from './blog'
import { contactSchema } from './contact'
import { siteSettingsSchema } from './siteSettings'
import { autoresponderSchema } from './autoresponder'
import { leadSchema } from './lead'
import { projectCategorySchema } from './projectCategory'

export const schemaTypes = [
  siteSettingsSchema,
  projectCategorySchema,
  autoresponderSchema,
  leadSchema,
  homeSchema,
  aboutSchema,

  projectsSchema,
  blogSchema,
  contactSchema,
]
