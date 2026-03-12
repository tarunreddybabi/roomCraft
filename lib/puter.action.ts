import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uplaodImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

export const signIn = async () => {
  await puter.auth.signIn();
};

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch {
    return null;
  }
};

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  const projectId = item.id

  const hosting = await getOrCreateHostingConfig()

  const hostedSource = projectId ? await uplaodImageToHosting({ hosting, url: item.sourceImage, projectId, label: 'source' }) : null

  const hostedRender = projectId && item.renderedImage ? await uplaodImageToHosting({ hosting, url: item.renderedImage, projectId, label: 'rendered' }) : null

  const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '')

  if (!resolvedSource) {
    console.warn("Failed to resolve source image for project")
    return null;
  }
  const resolvedRender = hostedRender?.url ? hostedRender?.url : item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined

  const { sourcePath: _sourcePath, renderedPath: _renderedPath, publicPath: _publicPath, ...rest } = item

  const payload = { ...rest, sourceImage: resolvedSource, renderedImage: resolvedRender }

  try {
    return payload
  } catch (e) {
    console.warn("Failed to create project", e)
    return null
  }

}