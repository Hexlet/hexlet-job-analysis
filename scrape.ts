import { PlaywrightCrawler, Dataset } from 'crawlee'

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log }) {
    const title = await page.title()
    log.info(`Title of ${request.loadedUrl} is '${title}'`)

    // Save results as JSON to ./storage/datasets/default
    await Dataset.pushData({ title, url: request.loadedUrl })

    // Extract links from the current page
    // and add them to the crawling queue.
    const pageLinks = enqueueLinks({
      label: 'Page',
      strategy: 'same-domain',
      selector: '[data-qa="pager-page"]',
    })

    const vacancyLinks = enqueueLinks({
      label: 'Vacancy',
      strategy: 'same-domain',
      globs: ['https://hh.ru/vacancy/*'],
    })

    await Promise.all([pageLinks, vacancyLinks])
  },
  maxRequestsPerCrawl: 10,
  // Uncomment this option to see the browser window.
  headless: true,
})

export default async function scrape() {
  const baseUrl = 'https://hh.ru/search/vacancy'
  const qs = '?text=ruby&area=1&hhtmFrom=main&hhtmFromLabel=vacancy_search_line'
  const params = new URLSearchParams(qs)
  const url = new URL(`${baseUrl}?${params}`)
  console.log(url)

  const result = await crawler.run([url.toString()])
  console.log(result)
}
