import { client } from '@/lib/sanity'

// Fetch unique categories (Areas) that have at least one active project
export async function getActiveAreas(): Promise<string[]> {
  const query = `
    *[_type == "projects"][0] {
      "areas": projectEntries[].category->title
    }
  `
  const result = await client.fetch(query)
  const areas = result?.areas || []
  
  // Return unique areas
  return Array.from(new Set(areas)) as string[]
}

export async function getProjectsByArea(areaName: string) {
  const query = `
    *[_type == "projects"][0].projectEntries[category->title == $areaName] {
      name,
      location,
      "brochureUrl": brochure[0].asset->url,
      "layoutUrl": layoutPdf[0].asset->url,
      googleMapsUrl
    }
  `
  const projects = await client.fetch(query, { areaName })
  return projects || []
}

export async function getProjectDetails(projectName: string) {
  const query = `
    *[_type == "projects"][0].projectEntries[name == $projectName][0] {
      name,
      location,
      "brochureUrl": brochure[0].asset->url,
      "layoutUrl": layoutPdf[0].asset->url,
      googleMapsUrl
    }
  `
  const project = await client.fetch(query, { projectName })
  return project
}
