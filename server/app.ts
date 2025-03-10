import path from 'node:path'

import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = (
  fastify,
  opts,
): Promise<void> => {
  // Place here your custom code!

  // if (isDebugMode()) {
  //   debug.enable(getBackendDebugNamespacesAsString())
  // }

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // void fastify.register(AutoLoad, {
  //   dir: path.join(import.meta.dirname, 'plugins'),
  //   options: opts,
  // })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // void fastify.register(AutoLoad, {
  //   dir: path.join(import.meta.dirname, 'routes'),
  //   options: opts,
  // })

  return Promise.resolve()
}

export default app
export { app, options }
