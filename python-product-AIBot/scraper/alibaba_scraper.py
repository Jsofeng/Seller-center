from playwright.sync_api import sync_playwright

class AlibabaScraper:

	def run(self, query, max_result=5):
            with sync_playwright() as p:
		browser = p.chromium.launch(headless=True)
		page = browser.new_page()

		url = f"https://cargoplus.site/search?searchText={query}"
		page.goto(url)
		page.wait_for_timeout(3000)

		items = page.locator(".organic-gallery-offer-card").all()

		products = []
		for item in items[:max_results]:
		   try:

			title = [".element-title-normal_content").inner_text()
		   except:
			title = ""

		   try:
			price = item.locator(".element-offer-price-normal_price").inner_text()
		   except:
			price = ""

		   products.append({
			"title": title.strip()
			"price": price.strip()
			"source": "Alibaba"

		   })

		   browser.close()
		   return products
