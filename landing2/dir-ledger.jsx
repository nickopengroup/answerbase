// THE LEDGER — editorial / serif. Warm cream, deep forest-green accent, ruled columns, premium calm.
(function injectLedgerStyles() {
  if (document.getElementById('dir-ledger-styles')) return;
  const css = `
  .d3 { --paper:#F4F1E8; --paper2:#ECE7DA; --card:#FBFAF5; --ink:#1C1A14; --mid:#5A574C; --faint:#8C8979; --line:rgba(28,26,20,.16); --line2:rgba(28,26,20,.28); --acc:#2E5A45; --accsoft:#E1E8E0;
    background:var(--paper); color:var(--ink); width:1440px; font-family:'Archivo',sans-serif; -webkit-font-smoothing:antialiased; position:relative; }
  .d3 *{ box-sizing:border-box; }
  .d3 .serif{ font-family:'Newsreader',serif; }
  .d3 .wrap{ width:1200px; margin:0 auto; }
  .d3 .ey{ font-family:'Archivo',sans-serif; font-size:11.5px; letter-spacing:.22em; text-transform:uppercase; color:var(--acc); font-weight:600; display:inline-flex; align-items:center; gap:11px; }
  .d3 .ey:before{ content:''; width:22px; height:1px; background:var(--acc); }
  .d3 .ey.c:before{ display:none; }
  /* nav */
  .d3 .nav{ height:84px; border-bottom:1px solid var(--line2); display:flex; align-items:center; }
  .d3 .nav .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d3 .brand{ display:flex; align-items:center; gap:12px; }
  .d3 .brand .mk{ width:30px; height:30px; border-radius:50%; border:1.5px solid var(--acc); color:var(--acc); display:flex; align-items:center; justify-content:center; font-family:'Newsreader',serif; font-size:17px; font-style:italic; }
  .d3 .brand b{ font-family:'Newsreader',serif; font-size:24px; font-weight:500; letter-spacing:-.01em; }
  .d3 .navlinks{ display:flex; gap:32px; align-items:center; }
  .d3 .navlinks a{ font-size:14.5px; color:var(--ink); text-decoration:none; font-weight:500; white-space:nowrap; }
  .d3 .navlinks a:hover{ color:var(--acc); }
  .d3 .btn{ font-family:'Archivo'; font-size:14.5px; font-weight:600; padding:11px 22px; border-radius:40px; border:1px solid var(--ink); background:transparent; color:var(--ink); cursor:pointer; text-decoration:none; display:inline-block; transition:.15s; }
  .d3 .btn:hover{ background:var(--ink); color:var(--paper); }
  .d3 .btn-acc{ background:var(--acc); border-color:var(--acc); color:#fff; }
  .d3 .btn-acc:hover{ background:#234936; border-color:#234936; color:#fff; }
  /* hero */
  .d3 .hero{ padding:74px 0 22px; }
  .d3 .hero .top{ text-align:center; max-width:980px; margin:0 auto; }
  .d3 h1{ font-family:'Newsreader',serif; font-weight:400; font-size:84px; line-height:1.02; letter-spacing:-.02em; margin:26px 0 0; }
  .d3 h1 em{ font-style:italic; color:var(--acc); }
  .d3 .lede{ font-size:20px; line-height:1.55; color:var(--mid); max-width:620px; margin:28px auto 0; }
  .d3 .heroctas{ display:flex; gap:13px; margin-top:34px; justify-content:center; }
  .d3 .heroimg{ margin-top:56px; }
  /* chat card */
  .d3 .chat{ background:var(--card); border:1px solid var(--line2); border-radius:14px; overflow:hidden; box-shadow:0 30px 70px rgba(28,26,20,.14); max-width:760px; margin:0 auto; }
  .d3 .chat .top{ display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid var(--line); }
  .d3 .chat .top .l{ display:flex; align-items:center; gap:11px; font-size:13.5px; color:var(--mid); }
  .d3 .chat .top .l .av{ width:26px; height:26px; border-radius:50%; background:var(--accsoft); color:var(--acc); display:flex; align-items:center; justify-content:center; font-family:'Newsreader',serif; font-style:italic; font-size:14px; }
  .d3 .chat .top .st{ font-size:12px; color:var(--acc); display:flex; gap:7px; align-items:center; }
  .d3 .chat .top .st:before{ content:''; width:7px; height:7px; border-radius:50%; background:var(--acc); }
  .d3 .chatbody{ padding:28px 28px 30px; display:grid; grid-template-columns:1fr 1fr; gap:28px; align-items:center; }
  .d3 .q{ display:flex; justify-content:flex-end; }
  .d3 .q span{ display:inline-block; background:var(--paper2); border-radius:16px 16px 4px 16px; padding:14px 18px; font-size:16px; line-height:1.45; }
  .d3 .a-label{ font-family:'Archivo'; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--acc); font-weight:600; margin-bottom:10px; }
  .d3 .a-txt{ font-family:'Newsreader',serif; font-size:20px; line-height:1.45; }
  .d3 .a-txt b{ font-weight:600; color:var(--acc); }
  .d3 .cite{ margin-top:16px; display:flex; align-items:center; gap:11px; }
  .d3 .cite .chip{ font-size:12px; color:var(--acc); border:1px solid var(--acc); border-radius:40px; padding:5px 12px; display:inline-flex; gap:7px; align-items:center; font-weight:500; }
  .d3 .cite .lab{ font-size:12px; color:var(--faint); font-style:italic; font-family:'Newsreader',serif; }
  /* divider rule with label */
  .d3 .rule{ display:flex; align-items:center; gap:20px; padding:64px 0 0; }
  .d3 .rule .line{ flex:1; height:1px; background:var(--line2); }
  /* steps */
  .d3 .steps{ padding:18px 0 70px; }
  .d3 .stephead{ text-align:center; max-width:720px; margin:0 auto 50px; }
  .d3 .stephead h2{ font-family:'Newsreader',serif; font-weight:400; font-size:52px; line-height:1.05; letter-spacing:-.02em; margin:16px 0 0; }
  .d3 .stephead h2 em{ font-style:italic; color:var(--acc); }
  .d3 .stephead p{ font-size:18px; color:var(--mid); line-height:1.55; margin:18px auto 0; max-width:560px; }
  .d3 .srow{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; border-top:1px solid var(--line2); }
  .d3 .step{ padding:36px 32px 38px; border-right:1px solid var(--line); }
  .d3 .step:last-child{ border-right:none; }
  .d3 .step .num{ font-family:'Newsreader',serif; font-style:italic; font-size:40px; color:var(--acc); line-height:1; }
  .d3 .step h3{ font-family:'Newsreader',serif; font-weight:500; font-size:26px; letter-spacing:-.01em; margin:14px 0 10px; }
  .d3 .step p{ font-size:15px; line-height:1.6; color:var(--mid); margin:0 0 24px; }
  /* mini ui */
  .d3 .ui{ background:var(--card); border:1px solid var(--line2); border-radius:11px; overflow:hidden; }
  .d3 .ui .bar{ display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--line); font-size:12px; color:var(--faint); font-weight:500; }
  .d3 .ui .bar .d{ width:7px; height:7px; border-radius:50%; background:var(--line2); }
  .d3 .frow{ display:flex; align-items:center; gap:12px; padding:12px 14px; border-bottom:1px solid var(--line); font-size:13.5px; }
  .d3 .frow:last-child{ border-bottom:none; }
  .d3 .frow .ic{ width:26px; height:30px; border-radius:4px; background:var(--paper2); border:1px solid var(--line); flex:0 0 auto; }
  .d3 .frow .nm{ flex:1; } .d3 .frow .nm b{ font-weight:600; display:block; } .d3 .frow .nm small{ color:var(--faint); font-size:11px; }
  .d3 .stat{ font-size:11px; padding:4px 10px; border-radius:40px; font-weight:600; }
  .d3 .stat.ok{ color:var(--acc); background:var(--accsoft); }
  .d3 .stat.idx{ color:var(--mid); background:var(--paper2); }
  .d3 .askbar{ display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid var(--line); }
  .d3 .askbar .inp{ flex:1; font-size:14px; color:var(--mid); font-family:'Newsreader',serif; font-style:italic; }
  .d3 .askbar .send{ width:28px; height:28px; border-radius:50%; background:var(--acc); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; }
  .d3 .ans{ padding:14px; font-size:13.5px; line-height:1.55; color:var(--ink); font-family:'Newsreader',serif; }
  .d3 .ans .src{ margin-top:10px; font-family:'Archivo'; font-size:10.5px; color:var(--acc); border:1px solid var(--acc); border-radius:40px; display:inline-block; padding:3px 10px; letter-spacing:.04em; }
  .d3 .embed{ font-family:'Newsreader',serif; font-size:13px; padding:15px; line-height:1.8; color:var(--mid); }
  .d3 .embed code{ font-family:'Archivo'; font-size:12px; color:var(--ink); }
  .d3 .embed .tag{ color:var(--acc); font-weight:600; }
  .d3 .widgetwrap{ position:relative; height:104px; border-top:1px solid var(--line); background:var(--paper2); }
  .d3 .widgetwrap .bub{ position:absolute; right:14px; bottom:14px; width:46px; height:46px; border-radius:50%; background:var(--acc); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Newsreader',serif; font-style:italic; box-shadow:0 8px 24px rgba(46,90,69,.3); }
  .d3 .widgetwrap .mini{ position:absolute; right:14px; bottom:70px; width:166px; border:1px solid var(--line2); background:var(--card); border-radius:12px; padding:11px; font-size:12px; line-height:1.45; font-family:'Newsreader',serif; }
  /* honest */
  .d3 .honest{ background:var(--ink); color:var(--paper); padding:84px 0; }
  .d3 .honest .wrap{ display:grid; grid-template-columns:1.05fr .95fr; gap:64px; align-items:center; }
  .d3 .honest .ey{ color:#A9C4B5; } .d3 .honest .ey:before{ background:#A9C4B5; }
  .d3 .honest h2{ font-family:'Newsreader',serif; font-weight:400; font-size:56px; line-height:1.04; letter-spacing:-.02em; margin:18px 0 0; color:var(--paper); }
  .d3 .honest h2 em{ font-style:italic; color:#8FD3B3; }
  .d3 .checks{ list-style:none; padding:0; margin:32px 0 0; }
  .d3 .checks li{ display:flex; gap:16px; padding:18px 0; border-top:1px solid rgba(255,255,255,.14); font-size:17px; line-height:1.5; color:#E7E3D7; }
  .d3 .checks li .x{ font-family:'Newsreader',serif; font-style:italic; color:#8FD3B3; font-size:18px; }
  .d3 .refusal{ background:#23211A; border:1px solid rgba(255,255,255,.13); border-radius:14px; padding:26px; }
  .d3 .refusal .q span{ background:#312E25; color:#E7E3D7; }
  .d3 .refusal .deny{ background:rgba(143,211,179,.08); border:1px solid rgba(143,211,179,.28); border-radius:11px; padding:16px 18px; font-family:'Newsreader',serif; font-size:18px; line-height:1.5; color:#E7E3D7; margin-top:14px; }
  .d3 .refusal .deny b{ color:#8FD3B3; font-weight:600; }
  .d3 .refusal .glabel{ font-family:'Archivo'; font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:#8FD3B3; font-weight:600; margin:24px 0 6px; }
  .d3 .gaprow{ display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-top:1px solid rgba(255,255,255,.12); font-size:14.5px; color:#E7E3D7; }
  .d3 .gaprow .answer{ font-size:12px; color:#8FD3B3; border:1px solid rgba(143,211,179,.4); border-radius:40px; padding:4px 12px; }
  .d3 .gaprow .ct{ font-size:12px; color:#8C8979; font-style:italic; font-family:'Newsreader',serif; }
  /* pricing */
  .d3 .pricing{ padding:80px 0; }
  .d3 .prices{ display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:48px; }
  .d3 .plan{ background:var(--card); border:1px solid var(--line2); border-radius:16px; padding:40px 40px 42px; position:relative; }
  .d3 .plan.pro{ background:var(--ink); color:var(--paper); border-color:var(--ink); }
  .d3 .plan .pname{ display:flex; align-items:baseline; justify-content:space-between; }
  .d3 .plan .pname b{ font-family:'Newsreader',serif; font-size:28px; font-weight:500; }
  .d3 .plan.pro .pname b{ color:var(--paper); }
  .d3 .plan .tag{ font-size:11px; letter-spacing:.12em; color:var(--ink); background:#8FD3B3; border-radius:40px; padding:5px 12px; font-weight:600; }
  .d3 .price{ font-family:'Newsreader',serif; font-size:60px; font-weight:400; letter-spacing:-.02em; margin:18px 0 2px; }
  .d3 .price small{ font-family:'Archivo'; font-size:15px; font-weight:500; color:var(--mid); letter-spacing:0; }
  .d3 .plan.pro .price small{ color:#B9BBAE; }
  .d3 .plan ul{ list-style:none; padding:0; margin:26px 0 30px; }
  .d3 .plan ul li{ font-size:15.5px; padding:13px 0; border-top:1px solid var(--line); display:flex; gap:13px; align-items:center; }
  .d3 .plan.pro ul li{ border-top:1px solid rgba(255,255,255,.14); color:#E7E3D7; }
  .d3 .plan ul li .ck{ color:var(--acc); font-family:'Newsreader',serif; font-style:italic; }
  .d3 .plan.pro ul li .ck{ color:#8FD3B3; }
  .d3 .btn-paper{ background:var(--paper); border-color:var(--paper); color:var(--ink); }
  .d3 .btn-paper:hover{ background:#fff; border-color:#fff; color:var(--ink); }
  /* final */
  .d3 .final{ text-align:center; padding:96px 0 100px; border-top:1px solid var(--line2); }
  .d3 .final h2{ font-family:'Newsreader',serif; font-weight:400; font-size:72px; line-height:1.04; letter-spacing:-.02em; margin:0 auto; max-width:900px; }
  .d3 .final h2 em{ font-style:italic; color:var(--acc); }
  .d3 .final p{ font-size:19px; color:var(--mid); margin:24px 0 36px; }
  .d3 .foot{ border-top:1px solid var(--line2); padding:34px 0; }
  .d3 .foot .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d3 .foot .c{ font-size:13px; color:var(--faint); font-style:italic; font-family:'Newsreader',serif; }
  `;
  const s = document.createElement('style'); s.id = 'dir-ledger-styles'; s.textContent = css; document.head.appendChild(s);
})();

function DirLedger() {
  return (
    <div className="d3">
      {/* NAV */}
      <nav className="nav">
        <div className="wrap">
          <div className="brand"><span className="mk">A</span><b>Answerbase</b></div>
          <div className="navlinks">
            <a href="#">Продукт</a><a href="#">Как работает</a><a href="#">Цены</a><a href="#">Войти</a>
            <a href="#" className="btn btn-acc">Начать бесплатно</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="top">
            <div className="ey c">Ассистент на основе ваших документов</div>
            <h1>Ваши документы,<br/>отвечающие <em>вашим клиентам.</em></h1>
            <p className="lede">Answerbase превращает FAQ, инструкции и регламенты, которые у вас уже есть, в чат-ассистента на сайте — клиенты получают точные ответы, а команда перестаёт повторять одно и то же.</p>
            <div className="heroctas">
              <a href="#" className="btn btn-acc">Начать бесплатно</a>
              <a href="#" className="btn">Смотреть цены</a>
            </div>
          </div>
          <div className="heroimg">
            <div className="chat">
              <div className="top">
                <span className="l"><span className="av">A</span> Бухгалтерия «Меридиан» · ассистент</span>
                <span className="st">на связи</span>
              </div>
              <div className="chatbody">
                <div className="q"><span>Сколько стоит тариф Pro и что в него входит?</span></div>
                <div>
                  <div className="a-label">Ответ из ваших документов</div>
                  <div className="a-txt">Тариф <b>Pro — $29 в месяц</b>: 3 ассистента, 500 страниц и 2 000 сообщений в месяц.</div>
                  <div className="cite"><span className="chip">↳ pricing.pdf · стр. 2</span><span className="lab">источник процитирован</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STEPS */}
      <section className="steps">
        <div className="wrap">
          <div className="stephead">
            <div className="ey c">Запуск</div>
            <h2>Живой ассистент <em>за три шага.</em></h2>
            <p>Без созвонов по настройке, без обучающих выборок и ML-жаргона. Принесите свои документы — этого достаточно.</p>
          </div>
          <div className="srow">
            <div className="step">
              <div className="num">i.</div>
              <h3>Загрузите документы</h3>
              <p>FAQ, прайсы, инструкции, что уже есть. PDF, Markdown или текст — Answerbase сам разберёт и проиндексирует, со статусом по каждому файлу.</p>
              <div className="ui">
                <div className="bar"><span className="d"></span> Документы</div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Прайс-лист 2026.pdf</b><small>PDF · 4 стр.</small></div><span className="stat ok">Готов</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Условия договора.md</b><small>MD · 11 KB</small></div><span className="stat ok">Готов</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Онбординг-гайд.txt</b><small>TXT · 6 KB</small></div><span className="stat idx">Индексация…</span></div>
              </div>
            </div>
            <div className="step">
              <div className="num">ii.</div>
              <h3>Проверьте в панели</h3>
              <p>Спросите так, как спрашивают клиенты. Ответ берётся только из ваших документов и ссылается на источник — вы заранее видите, что получит клиент.</p>
              <div className="ui">
                <div className="bar"><span className="d"></span> Песочница</div>
                <div className="askbar"><span className="inp">Можно ли вернуть оплату за месяц?</span><span className="send">→</span></div>
                <div className="ans">Да. Возврат за неиспользованный период оформляется в течение 14 дней по письменному запросу.<br/><span className="src">↳ Условия договора · §4.2</span></div>
              </div>
            </div>
            <div className="step">
              <div className="num">iii.</div>
              <h3>Поставьте на сайт</h3>
              <p>Скопируйте одну строку кода — виджет появляется на сайте в вашем фирменном цвете. Клиенты спрашивают в углу, вы не делаете ничего.</p>
              <div className="ui">
                <div className="bar"><span className="d"></span> Код для вставки</div>
                <div className="embed"><code><span className="tag">&lt;script</span> src="answerbase.io/w.js" data-bot="meridian"<span className="tag">&gt;&lt;/script&gt;</span></code></div>
                <div className="widgetwrap"><div className="mini">Здравствуйте! Чем помочь по документам «Меридиан»?</div><div className="bub">A</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST */}
      <section className="honest">
        <div className="wrap">
          <div>
            <div className="ey">Никогда не выдумывает</div>
            <h2>Когда не знает —<br/><em>так и говорит.</em></h2>
            <ul className="checks">
              <li><span className="x">—</span>Никаких выдуманных цен, дат и условий: ответ либо есть в документах, либо его нет.</li>
              <li><span className="x">—</span>Каждый вопрос без ответа сохраняется, а не теряется в переписке.</li>
              <li><span className="x">—</span>Вы отвечаете один раз — и ассистент знает это с того же момента.</li>
            </ul>
          </div>
          <div className="refusal">
            <div className="q" style={{marginBottom:0}}><span style={{display:'inline-block',padding:'14px 18px',borderRadius:'16px 16px 4px 16px',fontSize:16}}>Делаете ли вы скидку для НКО?</span></div>
            <div className="deny">Этого <b>нет в ваших документах</b>, поэтому я не буду гадать — я сохранил вопрос для владельца.</div>
            <div className="glabel">Пробелы в базе знаний</div>
            <div className="gaprow"><span>Скидка для НКО?</span><span className="answer">Ответить →</span></div>
            <div className="gaprow"><span>Есть ли тариф для команд?</span><span className="ct">спросили ×7</span></div>
            <div className="gaprow"><span>Поддержка на выходных?</span><span className="ct">спросили ×3</span></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing">
        <div className="wrap">
          <div className="stephead" style={{marginBottom:0}}>
            <div className="ey c">Цены</div>
            <h2>Простые <em>тарифы.</em></h2>
            <p>Начните бесплатно. Перейдёте на Pro, когда клиенты завалят ассистента вопросами.</p>
          </div>
          <div className="prices">
            <div className="plan">
              <div className="pname"><b>Free</b><span style={{fontSize:13,color:'var(--faint)',fontStyle:'italic',fontFamily:'Newsreader,serif'}}>для старта</span></div>
              <div className="price">$0<small> / навсегда</small></div>
              <ul>
                <li><span className="ck">✦</span>1 ассистент</li>
                <li><span className="ck">✦</span>20 страниц документов</li>
                <li><span className="ck">✦</span>100 сообщений в месяц</li>
                <li><span className="ck">✦</span>Бейдж «Powered by Answerbase»</li>
              </ul>
              <a href="#" className="btn" style={{width:'100%',textAlign:'center'}}>Начать бесплатно</a>
            </div>
            <div className="plan pro">
              <div className="pname"><b>Pro</b><span className="tag">Популярный</span></div>
              <div className="price">$29<small> / в месяц</small></div>
              <ul>
                <li><span className="ck">✦</span>3 ассистента</li>
                <li><span className="ck">✦</span>500 страниц документов</li>
                <li><span className="ck">✦</span>2 000 сообщений в месяц</li>
                <li><span className="ck">✦</span>Без брендинга Answerbase</li>
              </ul>
              <a href="#" className="btn btn-paper" style={{width:'100%',textAlign:'center'}}>Начать бесплатно</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="wrap">
          <div className="ey c" style={{marginBottom:22}}>Хватит повторяться</div>
          <h2>Перестаньте отвечать на одни и те же <em>вопросы.</em></h2>
          <p>Соберите ассистента за несколько минут и передайте ему рутину.</p>
          <a href="#" className="btn btn-acc" style={{fontSize:16,padding:'15px 32px'}}>Начать бесплатно</a>
        </div>
      </section>
      <footer className="foot">
        <div className="wrap">
          <div className="brand"><span className="mk" style={{width:26,height:26,fontSize:15}}>A</span><b style={{fontSize:21}}>Answerbase</b></div>
          <span className="c">© 2026 · Документы, отвечающие вашим клиентам</span>
        </div>
      </footer>
    </div>
  );
}
window.DirLedger = DirLedger;
