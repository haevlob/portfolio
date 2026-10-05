/* All portfolio interactions are local. No personal data leaves the browser. */
(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  const toast = text => {const el = $('.toast'); if (!el) return; el.textContent = text; el.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 3300);};
  const scroll = id => {const target = document.getElementById(id); if (target) target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
  const activate = (nodes, target) => nodes.forEach(n => {const active=n===target; n.classList.toggle('active',active); n.setAttribute('aria-pressed',String(active));});
  if (document.body.dataset.site === 'portfolio') {
    $$('[data-portfolio-filter]').forEach(button => button.addEventListener('click', () => {
      activate($$('[data-portfolio-filter]'), button);
      $$('[data-project-type]').forEach(card => card.hidden = button.dataset.portfolioFilter !== 'all' && card.dataset.projectType !== button.dataset.portfolioFilter);
    }));
    return;
  }
  const data = JSON.parse($('#site-data').textContent);
  const id = data.id, prefix = `selected-works:${id}:`;
  const load = (key, fallback) => {try {return JSON.parse(localStorage.getItem(prefix+key)) ?? fallback;} catch {return fallback;}};
  const save = (key, value) => {try {localStorage.setItem(prefix+key,JSON.stringify(value));} catch {toast('Сохранение недоступно. Демо продолжает работать в этой вкладке.');}};
  const item = index => data.items[Number(index)];
  const src = file => '../../'+file;
  const image = (file, alt, cls='') => `<img src="${esc(src(file))}" alt="${esc(alt)}" class="${cls}">`;
  const btn = (text,action,attrs='',cls='btn') => `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${esc(text)} <span aria-hidden="true">→</span></button>`;
  const head = (title, text='') => `<div class="modal-head"><span class="eyebrow">${esc(data.brand)}</span><h2 id="dialog-title" tabindex="-1">${esc(title)}</h2>${text?`<p>${esc(text)}</p>`:''}</div>`;
  const note = text => `<p class="modal-note">${esc(text || 'Это интерактивный пример для портфолио. Данные не отправляются, реальные заказы и записи не создаются.')}</p>`;
  let cart = load('cart', []), favorites = load('favorites', []), exercises = load('exercises', []);
  if (!Array.isArray(cart)) cart=[];
  cart=cart.filter(row=>row&&item(row.index)&&Number.isFinite(row.qty)&&row.qty>0&&row.qty<=99).map(row=>({index:Number(row.index),qty:Math.floor(row.qty),options:String(row.options||'').slice(0,160),extra:Math.max(0,Math.min(5000,Number(row.extra)||0))}));
  if (!Array.isArray(favorites)) favorites=[];
  favorites=[...new Set(favorites.map(Number).filter(n=>item(n)))];
  if (!Array.isArray(exercises)) exercises=[];
  exercises=[...new Set(exercises.filter(n=>Number.isInteger(n)&&n>=0&&n<5))];
  const dialog = $('#app-dialog'), content = $('#dialog-content');
  let opener = null, lightbox = null;
  const open = html => {
    if(!dialog.open) opener=document.activeElement;
    content.innerHTML=html;
    dates(content);
    if(!dialog.open) dialog.showModal();
    document.body.style.overflow='hidden';
    $('#dialog-title',content)?.focus({preventScroll:true});
    dialog.scrollTop=0;
  };
  const close = () => dialog.close();
  dialog.addEventListener('close',()=>{document.body.style.overflow='';lightbox=null;opener?.focus?.({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
  function dates(root=document) {
    const now=new Date(), today=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    $$('input[type=date]',root).forEach(input=>{input.min=today;if(!input.value)input.value=today;});
  }
  dates();
  function counts() {
    const count=cart.reduce((sum,r)=>sum+r.qty,0);
    $$('.cart-count').forEach(el=>{el.textContent=count;el.hidden=!count;});
    $$('.fav-count').forEach(el=>{el.textContent=favorites.length;el.hidden=!favorites.length;});
    $$('[data-action=favorite]').forEach(el=>{const p=item(el.dataset.index), active=favorites.includes(Number(el.dataset.index));el.setAttribute('aria-pressed',String(active));el.setAttribute('aria-label',`${active?'Убрать из избранного':'В избранное'}: ${p?.name||''}`);});
  }
  counts();
  const rowPrice = row => item(row.index).price+row.extra;
  const subtotal = () => cart.reduce((sum,row)=>sum+rowPrice(row)*row.qty,0);
  const delivery = () => id==='mimi'&&subtotal()>0&&subtotal()<5000?350:0;
  function add(index, quantity=1, options='', extra=0) {
    index=Number(index); if(!item(index))return;
    quantity=Math.max(1,Math.min(99,Math.floor(Number(quantity)||1)));
    const row=cart.find(r=>r.index===index&&r.options===options&&r.extra===extra);
    if(row)row.qty=Math.min(99,row.qty+quantity);else cart.push({index,qty:quantity,options,extra});
    save('cart',cart);counts();toast(`${item(index).name} — в корзине`);
  }
  function product(index) {
    const p=item(index); if(!p)return;
    const option=id==='coffee'?`<label>Какой вариант?<select name="option"><option>Классический</option>${['Кофе','Авторские напитки'].includes(p.category)?'<option>На овсяном молоке</option><option>На кокосовом молоке</option><option>Без сиропа</option>':'<option>С собой</option>'}</select></label>`:id==='mimi'?`<label>Подарочная упаковка<select name="option"><option value="0">Без упаковки</option><option value="450">Коробка и лента · +450 ₽</option></select></label>`:`<label>Как подать?<select name="option"><option>С собой</option><option>В нашей кофейне</option></select></label>`;
    open(`<div class="modal-grid">${image(p.image,p.name)}<div>${head(p.name,p.desc)}<span class="eyebrow">${esc(p.category)}</span><div class="price">${rub(p.price)}</div><form class="modal-form" data-form="product" data-index="${Number(index)}">${option}<label>Количество<input type="number" name="quantity" min="1" max="20" value="1" required></label><button class="btn" type="submit">Добавить в корзину →</button></form>${note()}</div></div>`);
  }
  function showCart() {
    if(!cart.length){open(head('В корзине пока тихо')+`<div class="empty-state"><div class="empty-symbol" aria-hidden="true">♡</div><h3>Найдите своё любимое</h3><p>Добавьте что-нибудь из нашей коллекции.</p>${btn('Перейти к каталогу','go-catalog')}</div>`);return;}
    open(head('Ваша корзина',id==='mimi'?'Маленькие друзья уже ждут встречи.':'Собрали ваши маленькие радости.')+`<div class="cart-list">${cart.map((row,i)=>`<div class="cart-row">${image(item(row.index).image,item(row.index).name)}<div><h3>${esc(item(row.index).name)}</h3><p>${esc(row.options||item(row.index).desc)}</p><div class="cart-row-details"><div class="qty-control"><button data-action="quantity" data-row="${i}" data-delta="-1" aria-label="Уменьшить количество ${esc(item(row.index).name)}">−</button><span>${row.qty}</span><button data-action="quantity" data-row="${i}" data-delta="1" ${row.qty>=99?'disabled':''} aria-label="Увеличить количество ${esc(item(row.index).name)}">+</button></div><button class="remove-row" data-action="remove" data-row="${i}">Удалить</button></div></div><strong>${rub(rowPrice(row)*row.qty)}</strong></div>`).join('')}</div><div class="cart-summary"><div><span>Товары</span><strong>${rub(subtotal())}</strong></div>${id==='mimi'?`<div><span>Доставка</span><strong>${delivery()?rub(delivery()):'Бесплатно'}</strong></div>${delivery()?'<p class="small-note">Бесплатная доставка от 5 000 ₽.</p>':''}`:''}<div class="total"><span>Итого</span><strong>${rub(subtotal()+delivery())}</strong></div></div>${btn('Оформить демо-заказ','checkout')}${note('Можно пройти оформление, чтобы посмотреть весь сценарий. Никаких оплат и отправки данных.')}`);
  }
  function showFavorites() {
    open(head('Избранное','Сохраните то, к чему хочется вернуться.')+(favorites.length?`<div class="favorites-list">${favorites.map(n=>`<div class="favorite-row">${image(item(n).image,item(n).name)}<div><h3>${esc(item(n).name)}</h3><p>${rub(item(n).price)}</p><button class="remove-row" data-action="unfavorite" data-index="${n}">Убрать</button></div>${btn('В корзину','add',`data-index="${n}"`,'btn small')}</div>`).join('')}</div>`:`<div class="empty-state"><div class="empty-symbol" aria-hidden="true">♡</div><h3>Ваши будущие любимые</h3><p>Нажмите на сердечко у товара, чтобы сохранить его здесь.</p>${btn('Посмотреть коллекцию','go-catalog')}</div>`));
  }
  let category='all', query='', sort='default';
  function filterCatalog() {
    const cards=$$('[data-product]');
    cards.forEach(card=>card.hidden=!(category==='all'||card.dataset.category===category)||!card.dataset.name.includes(query));
    const grid=$('.product-grid');
    if(grid&&sort!=='default')cards.sort((a,b)=>sort==='name'?a.dataset.name.localeCompare(b.dataset.name,'ru'):(Number(a.dataset.price)-Number(b.dataset.price))*(sort==='desc'?-1:1)).forEach(c=>grid.append(c));
    if(grid&&sort==='default')cards.sort((a,b)=>Number(a.dataset.product)-Number(b.dataset.product)).forEach(c=>grid.append(c));
    const count=cards.filter(c=>!c.hidden).length;
    if($('[data-results-count]'))$('[data-results-count]').textContent=count;
    if($('.empty-results'))$('.empty-results').hidden=!!count;
  }
  function setCategory(value) {category=value;$$('[data-filter]').forEach(n=>{const on=n.dataset.filter===value;n.classList.toggle('active',on);n.setAttribute('aria-pressed',String(on));});filterCatalog();}
  $$('[data-filter]').forEach(n=>n.addEventListener('click',()=>setCategory(n.dataset.filter)));
  $('[name=catalog-search]')?.addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('ru');filterCatalog();});
  $('[data-sort]')?.addEventListener('change',e=>{sort=e.target.value;filterCatalog();});
  $$('[data-category-link]').forEach(n=>n.addEventListener('click',()=>{query='';if($('[name=catalog-search]'))$('[name=catalog-search]').value='';setCategory(n.dataset.categoryLink);}));
  $$('[data-gallery-filter]').forEach(n=>n.addEventListener('click',()=>{activate($$('[data-gallery-filter]'),n);$$('[data-gallery-category]').forEach(c=>c.hidden=n.dataset.galleryFilter!=='all'&&c.dataset.galleryCategory!==n.dataset.galleryFilter);}));
  function booking(selection='', mode='booking') {
    const isCoffee=id==='coffee',isTour=id==='wayfarer';
    let options=isCoffee?['2 гостя','1 гость','3 гостя','4 гостя','5 гостей','6 гостей']:data.categories;
    if(selection&&!options.includes(selection))options=[selection,...options];
    open(head(mode==='checkout'?'Оформить демо-заказ':isTour?'Ваше следующее путешествие':isCoffee?'Столик для вашего ритуала':id==='monolit'?'Обсудим ваш интерьер':'Время для новой истории',selection)+`<form class="modal-form" data-form="${mode}" data-selection="${esc(selection)}"><div class="form-row"><label>Ваше имя<input name="name" required minlength="2" maxlength="80" autocomplete="given-name" placeholder="Как к вам обращаться?"></label><label>Телефон<input name="phone" type="tel" required minlength="7" maxlength="24" autocomplete="tel" placeholder="+7 (___) ___-__-__"></label></div>${mode==='checkout'?`<label>${id==='mimi'?'Адрес для доставки':'Комментарий к заказу'}<textarea name="comment" maxlength="300" placeholder="В демо можно использовать любые примерные данные"></textarea></label><div class="success-summary"><div><span>Итого</span><strong>${rub(subtotal()+delivery())}</strong></div><div><span>Оплата</span><strong>Не требуется · демонстрация</strong></div></div>`:`<div class="form-row"><label>${isTour?'Дата отправления':'Дата'}<input type="date" name="date" required></label><label>${isTour?'Гостей':'Время'}<select name="time">${(isTour?['2 гостя','1 гость','3 гостя','4 гостя']:isCoffee?['09:00','11:00','13:00','15:00','17:00','19:00']:['10:00','11:00','12:00','14:00','15:00','16:00','17:00']).map(t=>`<option>${esc(t)}</option>`).join('')}</select></label></div><label>${isCoffee?'Гости':isTour?'Путешествие':'Формат'}<select name="service">${options.map(t=>`<option ${t===selection?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label>Пожелания <span class="muted">· необязательно</span><textarea name="comment" maxlength="300" placeholder="Поделитесь идеей, которая вам близка"></textarea></label>`}<button type="submit" class="btn">${mode==='checkout'?'Завершить демо-заказ':isTour?'Сформировать демо-заявку':isCoffee?'Выбрать столик':'Сформировать демо-запись'} →</button></form>${note()}`);
  }
  function success(title, summary, description='Демонстрация завершена. Данные никуда не отправлены; настоящая запись не создана.') {
    open(`<div class="success-icon" aria-hidden="true">✓</div>${head(title,description)}<div class="success-summary">${summary.map(([name,value])=>`<div><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>${btn('Продолжить знакомство','close')}`);
  }
  function service(index=0) {
    const name=data.categories[Number(index)]||data.categories[0];
    const file=data.images.categories[Number(index)]||data.images.hero;
    const copy=id==='move'?'Выберите ритм, который подходит именно вам. В этой программе собраны упражнения, поддержка и внимание к восстановлению.':id==='elena'?'Пространство, в котором можно говорить о важном, исследовать свои переживания и двигаться в своём темпе.':id==='hair'?'Образ начинается с разговора: о вашем стиле, повседневном ритме и том, как вы хотите себя чувствовать.':'Продуманная последовательность работ: от замера и планировки до финальных деталей. Мы начинаем с ваших пожеланий и понятного бюджета.';
    open(`<div class="modal-grid">${image(file,name)}<div>${head(name,copy)}<div class="success-summary">${(id==='move'?[['Фокус','Сила, энергия, регулярность'],['Формат','Группа или персонально'],['Продолжительность','45–60 минут']]:id==='monolit'?[['Этап 1','Обсуждение и замер'],['Этап 2','План и смета'],['Этап 3','Работы и финальная проверка']]:id==='elena'?[['Подход','Бережный диалог'],['Формат','Очная или онлайн-встреча'],['Продолжительность','50 минут']]:[['Подход','Консультация и подбор образа'],['Детали','Форма, цвет, уход'],['Формат','Индивидуальная запись']]).map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('')}</div>${btn(id==='monolit'?'Рассчитать проект':'Выбрать время',id==='monolit'?'calculator':'booking',`data-selection="${esc(name)}"`)}${note()}</div></div>`);
  }
  function calculate() {
    const form=$('[data-form=calculator]');if(!form)return 0;
    const area=Number(form.elements.area.value),rate=Number(form.elements.rate.value);
    const extra=(form.elements.design.checked?1800:0)+(form.elements.supervision.checked?600:0);
    const total=area*(rate+extra);
    $('#area-value').textContent=area;$('#calculated-total').textContent=rub(total);
    return total;
  }
  $('[data-form=calculator]')?.addEventListener('input',calculate);
  calculate();
  const workouts=[['Спокойная разминка','5 минут · суставная подвижность'],['Приседания','3 подхода · 12 повторений'],['Отжимания от опоры','3 подхода · 10 повторений'],['Планка','3 подхода · 30 секунд'],['Восстановление','5 минут · спокойное дыхание']];
  function tracker() {
    open(head('Сегодня — ещё один шаг','Отмечайте этапы, чтобы попробовать трекер. Это пример интерфейса, а не персональная тренировочная рекомендация.')+`<div class="progress-track"><div style="width:${exercises.length*20}%"></div></div><p class="tracker-progress" aria-live="polite">Готово ${exercises.length} из 5</p><div class="tracker-list">${workouts.map(([t,d],i)=>`<label class="exercise-row"><input type="checkbox" data-exercise="${i}" ${exercises.includes(i)?'checked':''}><span><strong>${t}</strong><small>${d}</small></span></label>`).join('')}</div><div class="modal-button-row">${btn('Начать заново','reset-tracker','','btn secondary')}${btn('Выбрать программу','program')}</div>${note('Отметки сохраняются только в этом браузере. Не выполняйте упражнения ради проверки демо: достаточно отметить этапы.')}`);
  }
  function gallery(index, kind='gallery') {
    const files=data.images[kind]?.length?data.images[kind]:[data.images.hero];
    index=(Number(index)+files.length)%files.length;
    lightbox={index,kind};
    open(head(kind==='portraits'?'Команда':id==='monolit'?'Детали интерьера':id==='hair'?'Галерея образов':'Детали нашего мира')+image(files[index],`${data.brand} — фотография ${index+1}`,'lightbox-image')+`<div class="lightbox-controls">${btn('Назад','gallery-prev','','btn small secondary')}<p>${index+1} / ${files.length}</p>${btn('Вперёд','gallery-next','','btn small secondary')}</div>`);
  }
  document.addEventListener('keydown',e=>{if(!dialog.open||!lightbox||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();gallery(lightbox.index+(e.key==='ArrowLeft'?-1:1),lightbox.kind);});
  const articles=[
    ['Как быть внимательнее к себе',['Иногда день проходит так быстро, что в нём не остаётся паузы, чтобы заметить своё состояние. Усталость, радость, раздражение и интерес могут сосуществовать. Для каждого из этих чувств есть место.','Небольшая остановка помогает услышать себя: что сейчас занимает мои мысли, чего мне хочется и какой темп сегодня подходит? Ответ не обязательно должен быть немедленным или окончательным.','Внимание к себе складывается из простых моментов. Это может быть спокойная прогулка, разговор с близким или вечер без спешки. У каждого человека свой способ оставаться в контакте с собой.']],
    ['Почему важно оставлять время для отдыха',['Отдых бывает разным. Для одного человека это тишина, для другого — встреча с друзьями, для третьего — смена обстановки. Нет единственного правильного сценария свободного вечера.','Плотное расписание часто оставляет мало места для спонтанности. Можно взглянуть на неделю и заметить, какие занятия дают ощущение наполненности, а какие требуют слишком много сил.','В этой заметке нет готового рецепта. Она приглашает подумать о личном ритме и о том, какое место в нём занимает время, принадлежащее только вам.']],
    ['Поддержка в период перемен',['Перемены открывают новые возможности и одновременно делают привычный мир менее предсказуемым. Разные чувства в такой период могут возникать одновременно.','Близкие люди, знакомые места и небольшие ежедневные ритуалы иногда становятся точками опоры. Можно замечать, какие отношения и занятия помогают чувствовать больше устойчивости.','У каждой истории свой темп. Эта короткая заметка — пример редакционного раздела сайта, а не индивидуальная психологическая консультация.']]
  ];
  function article(index) {const a=articles[index];if(!a)return;open(head(a[0])+`<div class="article-body">${image(data.images.gallery[index]||data.images.hero,a[0])}${a[1].map(p=>`<p>${esc(p)}</p>`).join('')}</div>${note('Редакционная заметка для демонстрации сайта. Не заменяет личную консультацию.')}`);}
  function gift() {
    open(head('Подарок со своей историей','Выберите маленького друга и добавьте личные детали.')+`<form data-form="gift" class="modal-form"><label>Ваш маленький друг<select name="product">${data.items.map((p,i)=>`<option value="${i}">${esc(p.name)} · ${rub(p.price)}</option>`).join('')}</select></label><label>Имя на ушке · +350 ₽<input name="embroidery" maxlength="20" placeholder="Например, София"></label><label>Упаковка<select name="wrap"><option value="450">Подарочная коробка и лента · 450 ₽</option><option value="0">Без упаковки</option></select></label><div class="cart-summary"><div class="total"><span>Ваш подарок</span><strong data-gift-total></strong></div></div><button type="submit" class="btn">Добавить подарок в корзину →</button></form>${note()}`);giftTotal();
  }
  function giftTotal() {const f=$('[data-form=gift]');if(!f)return;const p=item(f.elements.product.value);$('[data-gift-total]').textContent=rub(p.price+Number(f.elements.wrap.value)+(f.elements.embroidery.value.trim()?350:0));}
  function cake() {
    open(head('Торт для вашего момента','Соберите сочетание вкуса, веса и деталей праздника.')+`<form data-form="cake" class="modal-form"><div class="form-row"><label>Вес<select name="weight">${[1,1.5,2,2.5,3,4,5].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} кг</option>`).join('')}</select></label><label>Начинка<select name="flavor"><option>Ягодная ваниль</option><option>Шоколад и вишня</option><option>Морковь и карамель</option><option>Лимон и меренга</option></select></label></div><label>Оформление<select name="decoration"><option value="0">Сезонные ягоды</option><option value="700">Ягоды и цветы · +700 ₽</option><option value="500">Минимализм и надпись · +500 ₽</option></select></label><label>Надпись на торте<input name="inscription" maxlength="50" placeholder="Например, С днём рождения!"></label><label>Дата праздника<input type="date" name="date" required></label><div class="cart-summary"><div class="total"><span>Демо-расчёт</span><strong data-cake-total></strong></div><p class="small-note">2 200 ₽/кг + выбранное оформление</p></div><button type="submit" class="btn">Посмотреть результат →</button></form>${note()}`);cakeTotal();
  }
  function cakeTotal() {const f=$('[data-form=cake]');if(!f)return 0;const total=Number(f.elements.weight.value)*2200+Number(f.elements.decoration.value);$('[data-cake-total]').textContent=rub(total);return total;}
  let tourCategory='all';
  function filterTours(value) {tourCategory=value;$$('[data-tour-category]').forEach(n=>n.hidden=value!=='all'&&n.dataset.tourCategory!==value);$$('[data-tour-filter]').forEach(n=>{const active=n.dataset.tourFilter===value;n.classList.toggle('active',active);n.setAttribute('aria-pressed',String(active));});}
  $$('[data-tour-filter]').forEach(n=>n.addEventListener('click',()=>{filterTours(n.dataset.tourFilter);if($('[data-tour-search-info]'))$('[data-tour-search-info]').textContent='';}));
  $$('[data-tour-link]').forEach(n=>n.addEventListener('click',()=>filterTours(n.dataset.tourLink)));
  function tour(index) {
    const p=item(index);if(!p)return;
    const days=p.category==='Япония'?['Токио: ритм большого города','Киото: сады и традиции','Нара: спокойная прогулка','Свободный день для вашей истории']:p.category==='Италия'?['Знакомство с побережьем','Городские прогулки и гастрономия','Море, солнце и свободное время','Небольшое путешествие по окрестностям']:p.category==='Франция'?['Первый вечер в Париже','Музеи и кварталы города','Прогулка вдоль Сены','Свободный день и новые открытия']:['Знакомство с островом','Отдых у воды и закат','Природа и местная кухня','Ваш собственный ритм'];
    open(`<div class="modal-grid">${image(p.image,p.name)}<div>${head(p.name,p.desc)}<span class="eyebrow">${esc(p.category)}</span><div class="price">от ${rub(p.price)}</div><p>Пример маршрута. Программа, стоимость и условия представлены для портфолио.</p><div class="success-summary">${days.map((d,i)=>`<div><span>День ${i+1}</span><strong>${esc(d)}</strong></div>`).join('')}</div>${btn('Подобрать это путешествие','booking',`data-selection="${esc(p.name)}"`)}${note()}</div></div>`);
  }
  document.addEventListener('input',e=>{
    if(e.target.matches('[data-comparison]')){const root=e.target.closest('.comparison-images');$('.comparison-after',root).style.clipPath=`inset(0 0 0 ${e.target.value}%)`;$('.comparison-handle',root).style.left=e.target.value+'%';}
    if(e.target.closest('[data-form=gift]'))giftTotal();
    if(e.target.closest('[data-form=cake]'))cakeTotal();
    if(e.target.name==='phone')e.target.setCustomValidity('');
  });
  document.addEventListener('change',e=>{
    if(!e.target.matches('[data-exercise]'))return;
    const index=Number(e.target.dataset.exercise);
    exercises=e.target.checked?[...new Set([...exercises,index])]:exercises.filter(n=>n!==index);
    save('exercises',exercises);
    $('.progress-track>div',content).style.width=exercises.length*20+'%';
    $('.tracker-progress',content).textContent=exercises.length===5?'Тренировка отмечена полностью. Отличная работа!':`Готово ${exercises.length} из 5`;
  });
  document.addEventListener('submit',e=>{
    const form=e.target;if(!form.matches('[data-form]'))return;e.preventDefault();
    const values=Object.fromEntries(new FormData(form));
    const phone=form.elements.namedItem('phone');
    if(phone&&phone.value.replace(/\D/g,'').length<7){phone.setCustomValidity('Укажите номер, содержащий не менее 7 цифр. Для демонстрации можно использовать пример.');phone.reportValidity();return;}
    if(!form.reportValidity())return;
    switch(form.dataset.form){
      case 'product': {const option=form.elements.option;const extra=id==='mimi'?Number(option.value):0;const detail=extra?'Подарочная коробка и лента':id==='mimi'?'':option.value;add(form.dataset.index,values.quantity,detail,extra);close();break;}
      case 'gift': {const extra=Number(values.wrap)+(values.embroidery.trim()?350:0);const opts=[values.embroidery.trim()?`Имя: ${values.embroidery.trim()}`:'',Number(values.wrap)?'Подарочная коробка':'Без упаковки'].filter(Boolean).join(' · ');add(values.product,1,opts,extra);showCart();break;}
      case 'cake': {const total=cakeTotal();success('Ваш торт собран',[['Начинка',values.flavor],['Вес',values.weight+' кг'],['Оформление',form.elements.decoration.selectedOptions[0].text],['Надпись',values.inscription||'Без надписи'],['Дата',values.date],['Демо-стоимость',rub(total)]],'Это пример конфигуратора. Заказ не отправлен в пекарню.');break;}
      case 'booking': {success(id==='coffee'?'Ваш столик в демо выбран':id==='wayfarer'?'Идея путешествия сохранена на экране':'Ваше время в демо выбрано',[['Имя',values.name],['Формат',values.service||form.dataset.selection||'Консультация'],['Дата',values.date],['Время / гости',values.time]],'Сценарий завершён. Данные не отправлены; настоящая бронь или запись не создана.');form.reset();dates(form);break;}
      case 'checkout': {const sum=subtotal()+delivery(),qty=cart.reduce((n,r)=>n+r.qty,0);success('Демо-заказ сформирован',[['Имя',values.name],['Позиций',String(qty)],['Сумма',rub(sum)],['Статус','Демонстрация завершена']],'Покупка не совершена. Деньги не списаны, данные никуда не отправлены.');cart=[];save('cart',cart);counts();break;}
      case 'calculator': {booking(`${values.area} м² · ${rub(calculate())}`);break;}
      case 'newsletter': {success('Добро пожаловать в наш маленький клуб',[['Email',values.email],['Сценарий','Демонстрация подписки']],'Форма работает как пример. Адрес не сохранён и не отправлен, писем не будет.');form.reset();break;}
      case 'search': {query=values.query.trim().toLocaleLowerCase('ru');setCategory('all');const search=$('[name=catalog-search]');if(search)search.value=values.query;close();scroll('catalog');break;}
      case 'travel': {filterTours(values.destination);const text=$('[data-tour-search-info]');if(text)text.textContent=`${values.destination==='all'?'Все направления':values.destination} · ${values.date} · гостей: ${values.guests}. Стоимость и доступность иллюстративны.`;scroll('tours');break;}
    }
  });
  document.addEventListener('click',e=>{
    const target=e.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action,index=Number(target.dataset.index||0);
    switch(action){
      case 'close':close();break;
      case 'go-catalog':close();scroll('catalog');break;
      case 'product':product(index);break;
      case 'add':add(index);break;
      case 'cart':showCart();break;
      case 'favorites':showFavorites();break;
      case 'favorite': favorites=favorites.includes(index)?favorites.filter(n=>n!==index):[...favorites,index];save('favorites',favorites);counts();toast(favorites.includes(index)?'Сохранено в избранном':'Убрано из избранного');break;
      case 'unfavorite':favorites=favorites.filter(n=>n!==index);save('favorites',favorites);counts();showFavorites();break;
      case 'quantity': {const row=cart[Number(target.dataset.row)];if(!row)return;row.qty=Math.min(99,row.qty+Number(target.dataset.delta));cart=cart.filter(r=>r.qty>0);save('cart',cart);counts();showCart();break;}
      case 'remove':cart.splice(Number(target.dataset.row),1);save('cart',cart);counts();showCart();break;
      case 'checkout':if(cart.length)booking('','checkout');break;
      case 'search':open(head('Найдите своё любимое')+`<form data-form="search" class="modal-form"><label>Название товара<input name="query" type="search" placeholder="Например, ${id==='mimi'?'зайка':id==='coffee'?'капучино':'круассан'}" maxlength="100"></label><button type="submit" class="btn">Искать в каталоге →</button></form>`);setTimeout(()=>$('[name=query]',content)?.focus(),0);break;
      case 'booking':booking(target.dataset.selection||'');break;
      case 'calculator':if(dialog.open)close();if(target.dataset.selection){const rates={Базовый:'4500',Комфорт:'8900',Премиум:'12000'};const f=$('[data-form=calculator]');if(f&&rates[target.dataset.selection])f.elements.rate.value=rates[target.dataset.selection];calculate();}scroll('calculator');break;
      case 'service':service(index);break;
      case 'program':service(index);break;
      case 'tracker':tracker();break;
      case 'reset-tracker':exercises=[];save('exercises',exercises);tracker();break;
      case 'gift':gift();break;
      case 'cake':cake();break;
      case 'breakfast':setCategory('Завтраки');query='';if($('[name=catalog-search]'))$('[name=catalog-search]').value='';filterCatalog();scroll('catalog');break;
      case 'lightbox':gallery(index);break;
      case 'social':gallery(index);break;
      case 'gallery-prev':if(lightbox)gallery(lightbox.index-1,lightbox.kind);break;
      case 'gallery-next':if(lightbox)gallery(lightbox.index+1,lightbox.kind);break;
      case 'team': {const name=data.team[index];if(!name)return;open(`<div class="modal-grid">${image(data.images.portraits[index]||data.images.hero,name)}<div>${head(name,data.roles[index])}<p>${id==='hair'?'Внимание к вашему стилю, форме и деталям. Вместе найдём образ, в котором вы будете чувствовать себя уверенно.':id==='move'?'Системный подход, ясные ориентиры и поддержка на каждом этапе. Найдём формат, который подходит вашему ритму.':'Точные решения, понятные этапы и внимание к вашей идее дома. От первого разговора до последних деталей.'}</p>${btn('Познакомиться','booking',`data-selection="${esc(name)}"`)}${note('Персонаж и его описание созданы для портфолио-концепта.')}</div></div>`);break;}
      case 'article':article(index);break;
      case 'tour':tour(index);break;
      case 'travel':booking('Индивидуальный подбор путешествия');break;
      case 'story':open(head(data.aboutTitle.replace(/<[^>]*>/g,''),data.about)+image(data.images.about||data.images.hero,data.brand,'lightbox-image')+note('Эта история иллюстрирует вымышленный бренд и настроение сайта.'));break;
      case 'demo':open(head('О демонстрации и данных','Этот сайт создан как самостоятельный проект для портфолио.')+`<div class="article-body"><p>Здесь можно пользоваться каталогом, фильтрами, галереями и формами. Все цены, показатели, отзывы, персонажи и названия компаний иллюстративны.</p><p>Формы не отправляют сведения на сервер. Покупки, платежи и бронирования не создаются. Корзина, избранное и отметки трекера сохраняются только в вашем браузере.</p><p>Визуалы включают предоставленные автором макеты и изображения, созданные для этой коллекции. На сайтах нет аналитических счётчиков или сторонних рекламных скриптов.</p></div>${btn('Все проекты','all-projects')}`);break;
      case 'all-projects':location.href='../../';break;
    }
  });
  const toggle=$('.menu-toggle'),nav=$('.main-nav');
  const navClose=()=>{nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Открыть меню');};
  toggle?.addEventListener('click',()=>{const active=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(active));toggle.setAttribute('aria-label',active?'Закрыть меню':'Открыть меню');});
  nav?.addEventListener('click',e=>{if(e.target.closest('a'))navClose();});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))navClose();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')navClose();});
  window.addEventListener('resize',()=>{if(innerWidth>960)navClose();});
})();
