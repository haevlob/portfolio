const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:8767/';
const out=process.argv[3]||path.resolve(__dirname,'../../portfolio-qa-20261014');
let browser;
(async()=>{
await fs.mkdir(out,{recursive:true});
browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage(),errors=[],failed=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push(`${r.status()} ${r.url()}`)});
await page.goto(base,{waitUntil:'networkidle'});
await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('img')].filter(i=>i.src).map(async i=>{i.loading='eager';await i.decode()}))});
assert.equal(await page.locator('.case-card').count(),3);
assert.equal(await page.locator('.web-card').count(),8);
assert.equal(await page.locator('#web a[href*="t.me"]').count(),0);
assert.equal(await page.locator('.gallery-author a').getAttribute('href'),'https://t.me/MusicalBlueLotus26');
await page.screenshot({path:path.join(out,'desktop-hero.png')});
await page.screenshot({path:path.join(out,'desktop-full.png'),fullPage:true});
await page.locator('#work').screenshot({path:path.join(out,'marketplace-section.png')});
for(const key of ['ember','lume','aura']){
await page.locator(`.case-card [data-open-case="${key}"]`).first().click();
await page.waitForFunction(()=>document.querySelector('#gallery-image').complete&&document.querySelector('#gallery-image').naturalWidth>0);
assert.equal(await page.locator('dialog').evaluate(d=>d.open),true);
assert.equal(new URL(page.url()).searchParams.get('project'),key);
for(let i=0;i<5;i++){
await page.locator('.gallery-thumbs button').nth(i).click();
await page.locator('#gallery-image').evaluate(i=>i.decode());
assert.match(await page.locator('#slide-count').innerText(),new RegExp(`0${i+1} / 05`));
assert.equal(await page.locator('.gallery-thumbs button[aria-pressed=true]').count(),1);
assert.match(await page.locator('#download-slide').getAttribute('href'),new RegExp(`/0${i+1}\\.png$`));
}
await page.locator('.gallery-thumbs button').first().click();
if(key==='ember')await page.screenshot({path:path.join(out,'desktop-gallery.png')});
await page.keyboard.press('ArrowRight');assert.match(await page.locator('#slide-count').innerText(),/02/);
await page.keyboard.press('Escape');assert.equal(await page.locator('dialog').evaluate(d=>d.open),false);
}
await page.locator('[data-filter=beauty]').click();assert.equal(await page.locator('.case-card:visible').count(),1);
await page.locator('[data-filter=tech]').click();assert.equal(await page.locator('.case-card:visible').count(),2);
await page.locator('[data-filter=all]').click();assert.equal(await page.locator('.case-card:visible').count(),3);
await page.goto(base+'?project=lume',{waitUntil:'networkidle'});assert.equal(await page.locator('dialog').evaluate(d=>d.open),true);await page.keyboard.press('Escape');
for(const width of [320,360,390,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(sizes.scroll<=sizes.viewport,`Layout overflow at ${width}: ${JSON.stringify(sizes)}`);}
await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});
await page.evaluate(()=>document.fonts.ready);
const mobileWidth=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
assert.ok(mobileWidth.scroll<=mobileWidth.viewport,`Mobile overflow: ${JSON.stringify(mobileWidth)}`);
await page.screenshot({path:path.join(out,'mobile-hero.png')});
await page.locator('#work').screenshot({path:path.join(out,'mobile-work.png')});
await page.locator('.case-card [data-open-case=ember]').first().click();await page.locator('#gallery-image').evaluate(i=>i.decode());
await page.screenshot({path:path.join(out,'mobile-gallery.png')});
await page.locator('.gallery-arrow.next').click();assert.match(await page.locator('#slide-count').innerText(),/02/);
const downloadPromise=page.waitForEvent('download');await page.locator('#download-slide').click();const download=await downloadPromise;assert.equal(await download.failure(),null);await download.saveAs(path.join(out,download.suggestedFilename()));
const zipResponse=await context.request.get(base+'assets/marketplace/ember/ember-series.zip');assert.equal(zipResponse.status(),200);assert.ok((await zipResponse.body()).length>100000);
await page.locator('.gallery-close').click();
for(const key of ['mimi','monolit','move','elena','coffee','hair','bakery','wayfarer']){const r=await context.request.get(base+`projects/${key}/`);assert.equal(r.status(),200);}
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
console.log(JSON.stringify({url:base,cases:3,slides:15,webProjects:8,mobileWidth,consoleErrors:errors,failedRequests:failed,screenshots:out},null,2));
await browser.close();
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1});
