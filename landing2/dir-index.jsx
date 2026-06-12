// THE INDEX — Swiss grid / editorial. Light, black & white, hairlines, one signal accent.
(function injectIndexStyles() {
  if (document.getElementById('dir-index-styles')) return;
  const css = `
  .d1 { --paper:#FAF9F6; --ink:#16150F; --mid:#6E6B61; --faint:#9C998E; --line:rgba(20,18,10,.16); --line-strong:rgba(20,18,10,.34); --acc:#E23A28; --paper2:#F1EFE8;
    background:var(--paper); color:var(--ink); width:1440px; font-family:'Archivo',sans-serif; -webkit-font-smoothing:antialiased; position:relative; }
  .d1 *{ box-sizing:border-box; }
  .d1 .mono{ font-family:'Spline Sans Mono',monospace; }
  .d1 .wrap{ width:1280px; margin:0 auto; padding:0 0; }
  .d1 .ey{ font-family:'Spline Sans Mono',monospace; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--mid); }
  .d1 .accbar{ color:var(--acc); }
  /* nav */
  .d1 .nav{ height:78px; border-bottom:1px solid var(--ink); display:flex; align-items:center; }
  .d1 .nav .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d1 .brand{ display:flex; align-items:baseline; gap:10px; }
  .d1 .brand b{ font-size:22px; font-weight:800; letter-spacing:-.02em; }
  .d1 .brand .dot{ width:9px; height:9px; background:var(--acc); display:inline-block; }
  .d1 .navlinks{ display:flex; gap:30px; align-items:center; }
  .d1 .navlinks a{ font-size:14.5px; color:var(--ink); text-decoration:none; font-weight:500; white-space:nowrap; }
  .d1 .navlinks a:hover{ color:var(--acc); }
  .d1 .navcta{ display:flex; gap:10px; align-items:center; }
  .d1 .btn{ font-family:'Archivo'; font-size:14.5px; font-weight:600; padding:11px 20px; border:1px solid var(--ink); background:transparent; color:var(--ink); cursor:pointer; text-decoration:none; display:inline-block; transition:.15s; }
  .d1 .btn:hover{ background:var(--ink); color:var(--paper); }
  .d1 .btn-solid{ background:var(--ink); color:var(--paper); }
  .d1 .btn-solid:hover{ background:var(--acc); border-color:var(--acc); color:#fff; }
  .d1 .btn-acc{ background:var(--acc); border-color:var(--acc); color:#fff; }
  .d1 .btn-acc:hover{ background:#c42e1d; border-color:#c42e1d; }
  /* hero */
  .d1 .hero{ border-bottom:1px solid var(--ink); }
  .d1 .hero .grid{ display:grid; grid-template-columns:1fr 1fr; }
  .d1 .hero .left{ padding:64px 56px 60px 0; border-right:1px solid var(--line); }
  .d1 .hero .right{ padding:64px 0 60px 56px; display:flex; flex-direction:column; justify-content:center; }
  .d1 h1{ font-size:74px; line-height:.96; letter-spacing:-.03em; font-weight:800; margin:22px 0 0; }
  .d1 h1 em{ font-style:normal; position:relative; }
  .d1 h1 .u{ box-shadow:inset 0 -10px 0 rgba(226,58,40,.22); }
  .d1 .lede{ font-size:19px; line-height:1.5; color:var(--mid); max-width:480px; margin:30px 0 0; }
  .d1 .heroctas{ display:flex; gap:12px; margin-top:36px; align-items:center; }
  .d1 .metarow{ display:flex; gap:0; margin-top:46px; border-top:1px solid var(--line); }
  .d1 .metarow .m{ flex:1; padding:18px 18px 0 0; }
  .d1 .metarow .m .n{ font-size:30px; font-weight:800; letter-spacing:-.02em; }
  .d1 .metarow .m .l{ font-size:12.5px; color:var(--mid); margin-top:3px; line-height:1.35; }
  /* chat card */
  .d1 .chatcard{ border:1px solid var(--ink); background:#fff; }
  .d1 .chatcard .top{ display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border-bottom:1px solid var(--line); }
  .d1 .chatcard .top .t{ font-family:'Spline Sans Mono',monospace; font-size:12px; letter-spacing:.04em; color:var(--mid); }
  .d1 .dotline{ display:flex; gap:6px; }
  .d1 .dotline i{ width:8px; height:8px; border:1px solid var(--line-strong); display:block; }
  .d1 .chatbody{ padding:22px 20px 24px; }
  .d1 .q{ display:flex; justify-content:flex-end; margin-bottom:18px; }
  .d1 .q span{ display:inline-block; background:var(--paper2); border:1px solid var(--line); padding:12px 15px; font-size:15px; max-width:78%; }
  .d1 .a-label{ font-family:'Spline Sans Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--acc); margin-bottom:8px; }
  .d1 .a-txt{ font-size:15.5px; line-height:1.55; }
  .d1 .cite{ margin-top:14px; border-top:1px dashed var(--line-strong); padding-top:12px; display:flex; align-items:center; gap:9px; }
  .d1 .cite .chip{ font-family:'Spline Sans Mono',monospace; font-size:11.5px; border:1px solid var(--ink); padding:4px 9px; display:inline-flex; gap:7px; align-items:center; }
  .d1 .cite .chip b{ color:var(--acc); }
  .d1 .cite .lab{ font-size:12px; color:var(--faint); font-family:'Spline Sans Mono',monospace; }
  .d1 .typing{ display:flex; gap:5px; margin-top:6px; }
  .d1 .typing i{ width:6px; height:6px; background:var(--line-strong); border-radius:50%; }
  /* section header */
  .d1 .sec{ border-bottom:1px solid var(--ink); }
  .d1 .sechead{ display:grid; grid-template-columns:1fr 1fr; padding:48px 0 38px; align-items:end; }
  .d1 .sechead h2{ font-size:44px; line-height:1; letter-spacing:-.025em; font-weight:800; margin:14px 0 0; }
  .d1 .sechead p{ font-size:16px; color:var(--mid); line-height:1.5; margin:0; align-self:end; max-width:440px; }
  /* steps */
  .d1 .steps{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
  .d1 .step{ padding:34px 30px 38px; border-right:1px solid var(--line); }
  .d1 .step:last-child{ border-right:none; }
  .d1 .step .num{ font-family:'Spline Sans Mono',monospace; font-size:13px; color:var(--acc); letter-spacing:.1em; }
  .d1 .step h3{ font-size:23px; letter-spacing:-.015em; font-weight:700; margin:16px 0 10px; }
  .d1 .step p{ font-size:15px; line-height:1.55; color:var(--mid); margin:0 0 22px; }
  /* mini UI */
  .d1 .ui{ border:1px solid var(--ink); background:#fff; }
  .d1 .ui .bar{ display:flex; align-items:center; gap:8px; padding:9px 12px; border-bottom:1px solid var(--line); font-family:'Spline Sans Mono',monospace; font-size:11px; color:var(--mid); letter-spacing:.04em; }
  .d1 .ui .bar .g{ width:7px; height:7px; border:1px solid var(--line-strong); }
  .d1 .frow{ display:flex; align-items:center; gap:11px; padding:11px 13px; border-bottom:1px solid var(--line); font-size:13.5px; }
  .d1 .frow:last-child{ border-bottom:none; }
  .d1 .frow .ic{ width:26px; height:30px; border:1px solid var(--line-strong); flex:0 0 auto; position:relative; }
  .d1 .frow .ic:after{ content:''; position:absolute; top:5px; left:5px; right:5px; height:1px; background:var(--line-strong); box-shadow:0 4px 0 var(--line-strong),0 8px 0 var(--line-strong); }
  .d1 .frow .nm{ flex:1; }
  .d1 .frow .nm b{ font-weight:600; display:block; }
  .d1 .frow .nm small{ color:var(--faint); font-family:'Spline Sans Mono',monospace; font-size:10.5px; }
  .d1 .stat{ font-family:'Spline Sans Mono',monospace; font-size:11px; padding:3px 8px; border:1px solid; letter-spacing:.04em; }
  .d1 .stat.ok{ color:#1f7a4d; border-color:#1f7a4d; }
  .d1 .stat.idx{ color:var(--mid); border-color:var(--line-strong); }
  .d1 .askbar{ display:flex; align-items:center; gap:10px; padding:12px 13px; border-bottom:1px solid var(--line); }
  .d1 .askbar .inp{ flex:1; font-size:13.5px; color:var(--ink); }
  .d1 .askbar .send{ width:26px; height:26px; background:var(--ink); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; }
  .d1 .ans{ padding:13px; font-size:13px; line-height:1.5; color:var(--ink); }
  .d1 .ans .src{ margin-top:9px; font-family:'Spline Sans Mono',monospace; font-size:10.5px; color:var(--acc); border:1px solid var(--acc); display:inline-block; padding:3px 7px; }
  .d1 .embed{ font-family:'Spline Sans Mono',monospace; font-size:11.5px; padding:13px; line-height:1.7; color:var(--ink); }
  .d1 .embed .tag{ color:var(--acc); }
  .d1 .embed .at{ color:var(--mid); }
  .d1 .widgetwrap{ position:relative; height:96px; background:var(--paper2); border-top:1px solid var(--line); }
  .d1 .widgetwrap .bub{ position:absolute; right:12px; bottom:12px; width:44px; height:44px; background:var(--ink); color:#fff; display:flex; align-items:center; justify-content:center; }
  .d1 .widgetwrap .mini{ position:absolute; right:12px; bottom:66px; width:150px; border:1px solid var(--ink); background:#fff; padding:9px; font-size:11px; line-height:1.4; }
  /* honest section */
  .d1 .honest{ display:grid; grid-template-columns:1.05fr .95fr; border-top:1px solid var(--ink); }
  .d1 .honest .l{ padding:54px 56px 54px 0; border-right:1px solid var(--line); }
  .d1 .honest .r{ padding:54px 0 54px 56px; display:flex; align-items:center; }
  .d1 .honest h2{ font-size:46px; line-height:1.0; letter-spacing:-.025em; font-weight:800; margin:16px 0 0; }
  .d1 .checks{ list-style:none; padding:0; margin:30px 0 0; }
  .d1 .checks li{ display:flex; gap:14px; padding:16px 0; border-top:1px solid var(--line); font-size:16px; line-height:1.45; align-items:flex-start; }
  .d1 .checks li .x{ font-family:'Spline Sans Mono',monospace; color:var(--acc); font-size:13px; margin-top:2px; }
  .d1 .refusal{ border:1px solid var(--ink); background:#fff; width:100%; }
  .d1 .refusal .rb{ padding:20px; }
  .d1 .refusal .deny{ border:1px solid var(--line-strong); background:var(--paper2); padding:14px 16px; font-size:15px; line-height:1.5; }
  .d1 .refusal .deny b{ color:var(--acc); }
  .d1 .gaprow{ display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-top:1px solid var(--line); font-size:13.5px; }
  .d1 .gaprow .qn{ font-weight:500; }
  .d1 .gaprow .ct{ font-family:'Spline Sans Mono',monospace; font-size:11px; color:var(--mid); }
  .d1 .gaprow .answer{ font-family:'Spline Sans Mono',monospace; font-size:11px; color:var(--acc); border:1px solid var(--acc); padding:3px 8px; }
  /* pricing */
  .d1 .pricing{ border-top:1px solid var(--ink); }
  .d1 .ptable{ display:grid; grid-template-columns:1fr 1fr; border-top:1px solid var(--ink); }
  .d1 .plan{ padding:40px 40px 44px; border-right:1px solid var(--line); }
  .d1 .plan:last-child{ border-right:none; position:relative; }
  .d1 .plan .pname{ display:flex; align-items:baseline; justify-content:space-between; }
  .d1 .plan .pname b{ font-size:24px; font-weight:700; }
  .d1 .plan .tag{ font-family:'Spline Sans Mono',monospace; font-size:11px; letter-spacing:.1em; color:#fff; background:var(--acc); padding:4px 9px; }
  .d1 .price{ font-size:54px; font-weight:800; letter-spacing:-.03em; margin:18px 0 4px; }
  .d1 .price small{ font-size:16px; font-weight:500; color:var(--mid); letter-spacing:0; }
  .d1 .plan ul{ list-style:none; padding:0; margin:26px 0 30px; }
  .d1 .plan ul li{ font-size:15px; padding:12px 0; border-top:1px solid var(--line); display:flex; gap:12px; }
  .d1 .plan ul li .mono{ color:var(--acc); font-size:12px; }
  /* final */
  .d1 .final{ padding:84px 0; border-top:1px solid var(--ink); text-align:center; }
  .d1 .final h2{ font-size:62px; line-height:1; letter-spacing:-.03em; font-weight:800; margin:0 auto; max-width:880px; }
  .d1 .final p{ font-size:18px; color:var(--mid); margin:24px 0 34px; }
  .d1 .foot{ border-top:1px solid var(--ink); padding:30px 0; }
  .d1 .foot .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d1 .foot .mono{ font-size:12px; color:var(--mid); letter-spacing:.04em; }
  `;
  const s = document.createElement('style'); s.id = 'dir-index-styles'; s.textContent = css; document.head.appendChild(s);
})();

function DirIndex() {
  return (
    <div className="d1">
      {/* NAV */}
      <nav className="nav">
        <div className="wrap">
          <div className="brand"><span className="dot"></span><b>Answerbase</b><span className="ey" style={{marginLeft:4}}>/ knowledge desk</span></div>
          <div className="navlinks">
            <a href="#">Продукт</a><a href="#">Как работает</a><a href="#">Цены</a><a href="#">Войти</a>
            <a href="#" className="btn btn-solid">Начать бесплатно</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="grid">
            <div className="left">
              <div className="ey">[01] &nbsp;Ассистент на ваших документах</div>
              <h1>Ваши документы<br/>отвечают <em className="u">за вас.</em></h1>
              <p className="lede">Answerbase превращает FAQ, инструкции и регламенты, которые у вас уже есть, в чат-ассистента на сайте. Клиенты получают точный ответ за секунду — команда перестаёт повторять одно и то же.</p>
              <div className="heroctas">
                <a href="#" className="btn btn-acc">Начать бесплатно &nbsp;→</a>
                <a href="#" className="btn">Смотреть цены</a>
              </div>
              <div className="metarow">
                <div className="m"><div className="n">3 шага</div><div className="l">от загрузки до виджета на сайте</div></div>
                <div className="m"><div className="n">0%</div><div className="l">выдуманных ответов — только источник</div></div>
                <div className="m"><div className="n">24/7</div><div className="l">отвечает, пока вы заняты делом</div></div>
              </div>
            </div>
            <div className="right">
              <div className="chatcard">
                <div className="top"><span className="t">assistant · widget</span><span className="dotline"><i></i><i></i><i></i></span></div>
                <div className="chatbody">
                  <div className="q"><span>Сколько стоит тариф Pro и что в него входит?</span></div>
                  <div className="a-label">Ответ из ваших документов</div>
                  <div className="a-txt">Тариф <b>Pro — $29 в месяц</b>: 3 ассистента, 500 страниц документов и 2 000 сообщений в месяц. Брендинг Answerbase на виджете отключается.</div>
                  <div className="cite">
                    <span className="chip"><b>↳</b> pricing.pdf · стр. 2</span>
                    <span className="lab">источник процитирован</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STEPS */}
      <section className="sec">
        <div className="wrap">
          <div className="sechead">
            <div><div className="ey">[02] &nbsp;Запуск</div><h2>Живой ассистент<br/>за три шага.</h2></div>
            <p>Без созвонов по настройке, без обучающих выборок и ML-жаргона. Принесите свои документы — этого достаточно.</p>
          </div>
        </div>
        <div className="wrap">
          <div className="steps">
            <div className="step">
              <div className="num">01 / Загрузка</div>
              <h3>Загрузите документы</h3>
              <p>FAQ, прайсы, инструкции, что уже есть. PDF, Markdown или текст — Answerbase сам разберёт и проиндексирует, со статусом по каждому файлу.</p>
              <div className="ui">
                <div className="bar"><span className="g"></span> documents / index</div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Прайс-лист 2026.pdf</b><small>PDF · 4 стр.</small></div><span className="stat ok">READY</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Условия договора.md</b><small>MD · 11 KB</small></div><span className="stat ok">READY</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Онбординг-гайд.txt</b><small>TXT · 6 KB</small></div><span className="stat idx">INDEXING…</span></div>
              </div>
            </div>
            <div className="step">
              <div className="num">02 / Проверка</div>
              <h3>Протестируйте в панели</h3>
              <p>Спросите так, как спрашивают клиенты. Ответ берётся только из ваших документов и ссылается на источник — вы заранее видите, что получит клиент.</p>
              <div className="ui">
                <div className="bar"><span className="g"></span> dashboard / playground</div>
                <div className="askbar"><span className="inp">Можно ли вернуть оплату за месяц?</span><span className="send">→</span></div>
                <div className="ans">Да. Возврат за неиспользованный период оформляется в течение 14 дней по письменному запросу.<br/><span className="src">↳ Условия договора.md · §4.2</span></div>
              </div>
            </div>
            <div className="step">
              <div className="num">03 / Публикация</div>
              <h3>Поставьте на сайт</h3>
              <p>Скопируйте одну строку кода — виджет появляется на сайте в вашем фирменном цвете. Клиенты спрашивают в углу, вы не делаете ничего.</p>
              <div className="ui">
                <div className="bar"><span className="g"></span> embed / snippet</div>
                <div className="embed"><span className="at">&lt;</span><span className="tag">script</span> <span className="at">src=</span>"answerbase.io/w.js"<br/>&nbsp;&nbsp;<span className="at">data-bot=</span>"acme"<span className="at">&gt;&lt;/</span><span className="tag">script</span><span className="at">&gt;</span></div>
                <div className="widgetwrap">
                  <div className="mini">Здравствуйте! Чем помочь по документам Acme?</div>
                  <div className="bub">✦</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST */}
      <section className="honest">
        <div className="wrap" style={{display:'contents'}}>
          <div className="l">
            <div className="ey accbar">[03] &nbsp;Никогда не выдумывает</div>
            <h2>Не знает — так<br/>и говорит.</h2>
            <ul className="checks">
              <li><span className="x">[01]</span><span>Никаких выдуманных цен, дат и условий — ответ либо есть в документах, либо его нет.</span></li>
              <li><span className="x">[02]</span><span>Каждый вопрос без ответа сохраняется, а не теряется в переписке.</span></li>
              <li><span className="x">[03]</span><span>Вы отвечаете один раз — и ассистент знает это с того же момента.</span></li>
            </ul>
          </div>
          <div className="r">
            <div className="refusal">
              <div className="bar" style={{borderBottom:'1px solid var(--line)'}}><span className="g"></span> unanswered / inbox</div>
              <div className="rb">
                <div className="q" style={{marginBottom:14}}><span style={{display:'inline-block',background:'var(--paper2)',border:'1px solid var(--line)',padding:'12px 15px',fontSize:15}}>Делаете ли вы скидку для НКО?</span></div>
                <div className="deny">Этого <b>нет в ваших документах</b>, поэтому я не буду гадать. Я сохранил вопрос для владельца.</div>
                <div style={{marginTop:22}}>
                  <div className="ey">Пробелы в базе знаний</div>
                  <div className="gaprow"><span className="qn">Скидка для НКО?</span><span className="answer">Ответить →</span></div>
                  <div className="gaprow"><span className="qn">Есть ли тариф для команд?</span><span className="ct">×7 раз</span></div>
                  <div className="gaprow"><span className="qn">Поддержка на выходных?</span><span className="ct">×3 раза</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing">
        <div className="wrap">
          <div className="sechead">
            <div><div className="ey">[04] &nbsp;Цены</div><h2>Простые тарифы.</h2></div>
            <p>Начните бесплатно. Перейдёте на Pro, когда клиенты завалят ассистента вопросами.</p>
          </div>
          <div className="ptable">
            <div className="plan">
              <div className="pname"><b>Free</b><span className="ey">для старта</span></div>
              <div className="price">$0<small> / навсегда</small></div>
              <ul>
                <li><span className="mono">01</span>1 ассистент</li>
                <li><span className="mono">02</span>20 страниц документов</li>
                <li><span className="mono">03</span>100 сообщений в месяц</li>
                <li><span className="mono">04</span>Бейдж «Powered by Answerbase»</li>
              </ul>
              <a href="#" className="btn">Начать бесплатно</a>
            </div>
            <div className="plan">
              <div className="pname"><b>Pro</b><span className="tag">ПОПУЛЯРНЫЙ</span></div>
              <div className="price">$29<small> / в месяц</small></div>
              <ul>
                <li><span className="mono">01</span>3 ассистента</li>
                <li><span className="mono">02</span>500 страниц документов</li>
                <li><span className="mono">03</span>2 000 сообщений в месяц</li>
                <li><span className="mono">04</span>Без брендинга Answerbase</li>
              </ul>
              <a href="#" className="btn btn-acc">Начать бесплатно &nbsp;→</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="wrap">
          <div className="ey" style={{marginBottom:24}}>[05] &nbsp;Хватит повторяться</div>
          <h2>Перестаньте отвечать на одни и те же вопросы.</h2>
          <p>Соберите ассистента за несколько минут и передайте ему рутину.</p>
          <a href="#" className="btn btn-acc" style={{fontSize:16,padding:'15px 30px'}}>Начать бесплатно &nbsp;→</a>
        </div>
      </section>
      <footer className="foot">
        <div className="wrap">
          <div className="brand"><span className="dot"></span><b style={{fontSize:18}}>Answerbase</b></div>
          <span className="mono">© 2026 · Документы, отвечающие за вас</span>
        </div>
      </footer>
    </div>
  );
}
window.DirIndex = DirIndex;
