// THE TERMINAL — dark / techno / premium. Near-black, single mint-cyan accent, glow, mono.
(function injectTerminalStyles() {
  if (document.getElementById('dir-terminal-styles')) return;
  const css = `
  .d2 { --bg:#0A0B0D; --bg2:#101216; --surf:#15181D; --surf2:#1B1F26; --tx:#EDEFF2; --mid:#8A929C; --faint:#5B636D; --line:rgba(255,255,255,.09); --line2:rgba(255,255,255,.16); --acc:#3DE8C4; --accdim:rgba(61,232,196,.14);
    background:var(--bg); color:var(--tx); width:1440px; font-family:'Space Grotesk',sans-serif; -webkit-font-smoothing:antialiased; position:relative; overflow:hidden; }
  .d2 *{ box-sizing:border-box; }
  .d2 .mono{ font-family:'JetBrains Mono',monospace; }
  .d2 .wrap{ width:1240px; margin:0 auto; }
  .d2 .glow{ position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
  .d2 .ey{ font-family:'JetBrains Mono',monospace; font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--acc); display:inline-flex; align-items:center; gap:9px; }
  .d2 .ey:before{ content:''; width:18px; height:1px; background:var(--acc); }
  /* nav */
  .d2 .nav{ position:relative; z-index:5; height:80px; border-bottom:1px solid var(--line); display:flex; align-items:center; }
  .d2 .nav .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d2 .brand{ display:flex; align-items:center; gap:11px; font-size:20px; font-weight:700; letter-spacing:-.01em; }
  .d2 .brand .mk{ width:26px; height:26px; border:1.5px solid var(--acc); border-radius:7px; display:flex; align-items:center; justify-content:center; color:var(--acc); font-size:14px; box-shadow:0 0 16px var(--accdim); }
  .d2 .navlinks{ display:flex; gap:30px; align-items:center; }
  .d2 .navlinks a{ font-size:14.5px; color:var(--mid); text-decoration:none; font-weight:500; white-space:nowrap; transition:.15s; }
  .d2 .navlinks a:hover{ color:var(--tx); }
  .d2 .btn{ font-family:'Space Grotesk'; font-size:14.5px; font-weight:600; padding:11px 20px; border-radius:9px; border:1px solid var(--line2); background:transparent; color:var(--tx); cursor:pointer; text-decoration:none; display:inline-block; transition:.15s; }
  .d2 .btn:hover{ border-color:var(--acc); color:var(--acc); }
  .d2 .btn-acc{ background:var(--acc); border-color:var(--acc); color:#04110D; box-shadow:0 0 0 rgba(61,232,196,.5); }
  .d2 .btn-acc:hover{ background:#5cf0d2; color:#04110D; box-shadow:0 8px 30px rgba(61,232,196,.32); }
  /* hero */
  .d2 .hero{ position:relative; z-index:2; padding:84px 0 86px; }
  .d2 .hero .grid{ display:grid; grid-template-columns:1.02fr .98fr; gap:60px; align-items:center; }
  .d2 h1{ font-size:67px; line-height:1.02; letter-spacing:-.03em; font-weight:700; margin:26px 0 0; }
  .d2 h1 .acc{ color:var(--acc); }
  .d2 .lede{ font-size:19px; line-height:1.55; color:var(--mid); max-width:500px; margin:28px 0 0; }
  .d2 .heroctas{ display:flex; gap:13px; margin-top:36px; align-items:center; }
  .d2 .pills{ display:flex; gap:10px; margin-top:40px; flex-wrap:wrap; }
  .d2 .pill{ font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--mid); border:1px solid var(--line); border-radius:20px; padding:7px 14px; display:inline-flex; gap:8px; align-items:center; }
  .d2 .pill i{ width:6px; height:6px; border-radius:50%; background:var(--acc); box-shadow:0 0 8px var(--acc); }
  /* chat card */
  .d2 .chat{ background:linear-gradient(180deg,#14171C,#0F1216); border:1px solid var(--line2); border-radius:18px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(61,232,196,.06), 0 0 60px rgba(61,232,196,.07); }
  .d2 .chat .top{ display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.02); }
  .d2 .chat .top .l{ display:flex; align-items:center; gap:10px; font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--mid); }
  .d2 .chat .top .l .av{ width:22px; height:22px; border-radius:6px; background:var(--accdim); border:1px solid var(--acc); color:var(--acc); display:flex; align-items:center; justify-content:center; font-size:11px; }
  .d2 .chat .top .st{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--acc); display:flex; align-items:center; gap:6px; }
  .d2 .chat .top .st:before{ content:''; width:6px; height:6px; border-radius:50%; background:var(--acc); box-shadow:0 0 8px var(--acc); }
  .d2 .chatbody{ padding:24px 22px 26px; }
  .d2 .q{ display:flex; justify-content:flex-end; margin-bottom:20px; }
  .d2 .q span{ display:inline-block; background:var(--surf2); border:1px solid var(--line); border-radius:14px 14px 4px 14px; padding:12px 16px; font-size:15px; max-width:80%; color:var(--tx); }
  .d2 .a{ display:flex; gap:12px; }
  .d2 .a .av2{ width:30px; height:30px; flex:0 0 auto; border-radius:9px; background:var(--accdim); border:1px solid var(--acc); color:var(--acc); display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 0 16px var(--accdim); }
  .d2 .a .bub{ background:rgba(61,232,196,.06); border:1px solid rgba(61,232,196,.22); border-radius:4px 14px 14px 14px; padding:14px 16px; font-size:15px; line-height:1.55; }
  .d2 .a .bub b{ color:var(--acc); }
  .d2 .cite{ margin-top:13px; display:flex; align-items:center; gap:10px; }
  .d2 .cite .chip{ font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--acc); border:1px solid rgba(61,232,196,.4); border-radius:7px; padding:5px 10px; background:var(--accdim); display:inline-flex; gap:7px; align-items:center; }
  .d2 .cite .lab{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--faint); }
  /* sections */
  .d2 .sec{ position:relative; z-index:2; padding:30px 0 80px; border-top:1px solid var(--line); }
  .d2 .sechead{ display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:end; padding:44px 0 46px; }
  .d2 .sechead h2{ font-size:46px; line-height:1.02; letter-spacing:-.025em; font-weight:700; margin:18px 0 0; }
  .d2 .sechead p{ font-size:17px; color:var(--mid); line-height:1.55; margin:0; align-self:end; max-width:460px; }
  /* steps */
  .d2 .steps{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
  .d2 .card{ background:var(--surf); border:1px solid var(--line); border-radius:16px; padding:26px 24px 26px; transition:.18s; position:relative; overflow:hidden; }
  .d2 .card:hover{ border-color:var(--line2); }
  .d2 .step .num{ font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--acc); letter-spacing:.12em; }
  .d2 .step h3{ font-size:23px; letter-spacing:-.01em; font-weight:600; margin:14px 0 9px; }
  .d2 .step p{ font-size:14.5px; line-height:1.55; color:var(--mid); margin:0 0 22px; }
  /* mini ui dark */
  .d2 .ui{ background:var(--bg2); border:1px solid var(--line); border-radius:11px; overflow:hidden; }
  .d2 .ui .bar{ display:flex; align-items:center; gap:8px; padding:9px 13px; border-bottom:1px solid var(--line); font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--faint); }
  .d2 .ui .bar i{ width:7px; height:7px; border-radius:50%; }
  .d2 .frow{ display:flex; align-items:center; gap:11px; padding:11px 13px; border-bottom:1px solid var(--line); font-size:13px; }
  .d2 .frow:last-child{ border-bottom:none; }
  .d2 .frow .ic{ width:24px; height:28px; border-radius:4px; background:var(--surf2); border:1px solid var(--line2); flex:0 0 auto; }
  .d2 .frow .nm{ flex:1; }
  .d2 .frow .nm b{ font-weight:500; display:block; color:var(--tx); }
  .d2 .frow .nm small{ color:var(--faint); font-family:'JetBrains Mono',monospace; font-size:10px; }
  .d2 .stat{ font-family:'JetBrains Mono',monospace; font-size:10px; padding:4px 8px; border-radius:6px; letter-spacing:.05em; }
  .d2 .stat.ok{ color:var(--acc); background:var(--accdim); border:1px solid rgba(61,232,196,.3); }
  .d2 .stat.idx{ color:var(--mid); background:var(--surf2); border:1px solid var(--line2); }
  .d2 .askbar{ display:flex; align-items:center; gap:10px; padding:11px 13px; border-bottom:1px solid var(--line); }
  .d2 .askbar .inp{ flex:1; font-size:13px; color:var(--mid); font-family:'JetBrains Mono',monospace; }
  .d2 .askbar .send{ width:26px; height:26px; border-radius:7px; background:var(--acc); color:#04110D; display:flex; align-items:center; justify-content:center; font-size:13px; }
  .d2 .ans{ padding:13px; font-size:12.5px; line-height:1.55; color:var(--tx); }
  .d2 .ans .src{ margin-top:9px; font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--acc); border:1px solid rgba(61,232,196,.35); background:var(--accdim); border-radius:6px; display:inline-block; padding:3px 8px; }
  .d2 .embed{ font-family:'JetBrains Mono',monospace; font-size:11.5px; padding:14px; line-height:1.8; }
  .d2 .embed .tag{ color:var(--acc); } .d2 .embed .at{ color:var(--faint); } .d2 .embed .str{ color:#E6C07B; }
  .d2 .widgetwrap{ position:relative; height:100px; border-top:1px solid var(--line); background:repeating-linear-gradient(45deg,rgba(255,255,255,.015) 0 8px,transparent 8px 16px); }
  .d2 .widgetwrap .bub{ position:absolute; right:13px; bottom:13px; width:44px; height:44px; border-radius:13px; background:var(--acc); color:#04110D; display:flex; align-items:center; justify-content:center; box-shadow:0 0 24px rgba(61,232,196,.4); }
  .d2 .widgetwrap .mini{ position:absolute; right:13px; bottom:68px; width:158px; border:1px solid var(--line2); background:var(--surf); border-radius:10px; padding:10px; font-size:11px; line-height:1.45; color:var(--mid); }
  /* honest — terminal log */
  .d2 .honest .grid{ display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
  .d2 .honest h2{ font-size:48px; line-height:1.02; letter-spacing:-.025em; font-weight:700; margin:16px 0 0; }
  .d2 .checks{ list-style:none; padding:0; margin:30px 0 0; }
  .d2 .checks li{ display:flex; gap:14px; padding:16px 0; border-top:1px solid var(--line); font-size:16px; line-height:1.45; color:var(--tx); }
  .d2 .checks li .x{ font-family:'JetBrains Mono',monospace; color:var(--acc); font-size:13px; }
  .d2 .term{ background:#0C0E11; border:1px solid var(--line2); border-radius:14px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.5); }
  .d2 .term .tbar{ display:flex; align-items:center; gap:7px; padding:12px 15px; border-bottom:1px solid var(--line); font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--faint); }
  .d2 .term .tbar i{ width:9px; height:9px; border-radius:50%; }
  .d2 .term .body{ padding:18px 18px 20px; font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.85; }
  .d2 .term .body .u{ color:var(--mid); } .d2 .term .body .p{ color:var(--acc); }
  .d2 .term .deny{ color:var(--tx); }
  .d2 .term .deny b{ color:var(--acc); }
  .d2 .gapbox{ margin-top:14px; border:1px solid var(--line); border-radius:9px; padding:12px 14px; }
  .d2 .gaprow{ display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-top:1px solid var(--line); font-size:12.5px; }
  .d2 .gaprow:first-child{ border-top:none; }
  .d2 .gaprow .answer{ color:var(--acc); font-size:11px; border:1px solid rgba(61,232,196,.35); background:var(--accdim); border-radius:6px; padding:3px 9px; }
  .d2 .gaprow .ct{ color:var(--faint); font-size:11px; }
  /* pricing */
  .d2 .prices{ display:grid; grid-template-columns:1fr 1fr; gap:22px; }
  .d2 .plan{ background:var(--surf); border:1px solid var(--line); border-radius:18px; padding:34px 34px 36px; position:relative; }
  .d2 .plan.pro{ border-color:rgba(61,232,196,.4); background:linear-gradient(180deg,rgba(61,232,196,.05),var(--surf)); box-shadow:0 0 50px rgba(61,232,196,.08); }
  .d2 .plan .pname{ display:flex; align-items:center; justify-content:space-between; }
  .d2 .plan .pname b{ font-size:22px; font-weight:600; }
  .d2 .plan .tag{ font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:.08em; color:#04110D; background:var(--acc); border-radius:20px; padding:5px 11px; }
  .d2 .price{ font-size:54px; font-weight:700; letter-spacing:-.03em; margin:20px 0 0; }
  .d2 .price small{ font-size:16px; font-weight:500; color:var(--mid); letter-spacing:0; }
  .d2 .plan ul{ list-style:none; padding:0; margin:24px 0 28px; }
  .d2 .plan ul li{ font-size:15px; padding:12px 0; border-top:1px solid var(--line); display:flex; gap:12px; color:var(--tx); }
  .d2 .plan ul li .mono{ color:var(--acc); }
  /* final */
  .d2 .final{ position:relative; z-index:2; padding:96px 0; text-align:center; border-top:1px solid var(--line); }
  .d2 .final h2{ font-size:60px; line-height:1.04; letter-spacing:-.03em; font-weight:700; margin:0 auto; max-width:860px; }
  .d2 .final h2 .acc{ color:var(--acc); }
  .d2 .final p{ font-size:18px; color:var(--mid); margin:24px 0 36px; }
  .d2 .foot{ border-top:1px solid var(--line); padding:30px 0; position:relative; z-index:2; }
  .d2 .foot .wrap{ display:flex; align-items:center; justify-content:space-between; }
  .d2 .foot .mono{ font-size:12px; color:var(--faint); }
  `;
  const s = document.createElement('style'); s.id = 'dir-terminal-styles'; s.textContent = css; document.head.appendChild(s);
})();

function DirTerminal() {
  return (
    <div className="d2">
      <div className="glow" style={{width:620,height:620,background:'rgba(61,232,196,.16)',top:-200,left:560}}></div>
      <div className="glow" style={{width:460,height:460,background:'rgba(61,232,196,.10)',top:1600,right:-120}}></div>

      {/* NAV */}
      <nav className="nav">
        <div className="wrap">
          <div className="brand"><span className="mk">✦</span>Answerbase</div>
          <div className="navlinks">
            <a href="#">Продукт</a><a href="#">Как работает</a><a href="#">Цены</a><a href="#">Войти</a>
            <a href="#" className="btn btn-acc">Начать бесплатно</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="grid">
            <div>
              <div className="ey">Ассистент на ваших документах</div>
              <h1>Ваши документы<br/>отвечают <span className="acc">за вас.</span></h1>
              <p className="lede">Answerbase превращает FAQ, гайды и регламенты, которые у вас уже есть, в чат-ассистента на сайте. Клиенты получают точный ответ за секунду — команда перестаёт повторять одно и то же.</p>
              <div className="heroctas">
                <a href="#" className="btn btn-acc">Начать бесплатно &nbsp;→</a>
                <a href="#" className="btn">Смотреть цены</a>
              </div>
              <div className="pills">
                <span className="pill"><i></i>Отвечает только из ваших файлов</span>
                <span className="pill"><i></i>Цитирует источник</span>
                <span className="pill"><i></i>Не выдумывает</span>
              </div>
            </div>
            <div>
              <div className="chat">
                <div className="top">
                  <span className="l"><span className="av">✦</span> Acme · assistant</span>
                  <span className="st">online</span>
                </div>
                <div className="chatbody">
                  <div className="q"><span>Сколько стоит тариф Pro и что в него входит?</span></div>
                  <div className="a">
                    <span className="av2">✦</span>
                    <div>
                      <div className="bub">Тариф <b>Pro — $29 в месяц</b>: 3 ассистента, 500 страниц документов и 2 000 сообщений в месяц. Брендинг Answerbase на виджете отключается.</div>
                      <div className="cite"><span className="chip">↳ pricing.pdf · p.2</span><span className="lab">источник процитирован</span></div>
                    </div>
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
            <div><div className="ey">Запуск</div><h2>Живой ассистент<br/>за три шага.</h2></div>
            <p>Без созвонов по настройке, без обучающих выборок и ML-жаргона. Принесите свои документы — этого достаточно.</p>
          </div>
          <div className="steps">
            <div className="card step">
              <div className="num">01 / UPLOAD</div>
              <h3>Загрузите документы</h3>
              <p>PDF, Markdown или текст. Answerbase сам разбирает и индексирует файлы, со статусом по каждому.</p>
              <div className="ui">
                <div className="bar"><i style={{background:'#3DE8C4'}}></i><i style={{background:'#2a2e35'}}></i><i style={{background:'#2a2e35'}}></i> &nbsp;documents</div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Прайс-лист 2026.pdf</b><small>PDF · 4 стр.</small></div><span className="stat ok">READY</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Условия договора.md</b><small>MD · 11 KB</small></div><span className="stat ok">READY</span></div>
                <div className="frow"><div className="ic"></div><div className="nm"><b>Онбординг-гайд.txt</b><small>TXT · 6 KB</small></div><span className="stat idx">INDEXING</span></div>
              </div>
            </div>
            <div className="card step">
              <div className="num">02 / TEST</div>
              <h3>Протестируйте в панели</h3>
              <p>Спросите так, как спрашивают клиенты. Ответ — только из ваших документов и со ссылкой на источник.</p>
              <div className="ui">
                <div className="bar"><i style={{background:'#3DE8C4'}}></i><i style={{background:'#2a2e35'}}></i><i style={{background:'#2a2e35'}}></i> &nbsp;playground</div>
                <div className="askbar"><span className="inp">Можно вернуть оплату?_</span><span className="send">→</span></div>
                <div className="ans">Да. Возврат за неиспользованный период — в течение 14 дней по письменному запросу.<br/><span className="src">↳ договор.md · §4.2</span></div>
              </div>
            </div>
            <div className="card step">
              <div className="num">03 / EMBED</div>
              <h3>Поставьте на сайт</h3>
              <p>Одна строка кода — и виджет появляется на сайте в вашем фирменном цвете.</p>
              <div className="ui">
                <div className="bar"><i style={{background:'#3DE8C4'}}></i><i style={{background:'#2a2e35'}}></i><i style={{background:'#2a2e35'}}></i> &nbsp;embed.html</div>
                <div className="embed"><span className="at">&lt;</span><span className="tag">script</span> <span className="at">src=</span><span className="str">"answerbase.io/w.js"</span><br/>&nbsp;&nbsp;<span className="at">data-bot=</span><span className="str">"acme"</span><span className="at">&gt;&lt;/</span><span className="tag">script</span><span className="at">&gt;</span></div>
                <div className="widgetwrap"><div className="mini">Здравствуйте! Чем помочь по документам Acme?</div><div className="bub">✦</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST */}
      <section className="sec honest">
        <div className="wrap">
          <div className="grid">
            <div>
              <div className="ey">Никогда не выдумывает</div>
              <h2>Не знает — так<br/>и говорит.</h2>
              <ul className="checks">
                <li><span className="x">→</span>Никаких выдуманных цен, дат и условий.</li>
                <li><span className="x">→</span>Каждый вопрос без ответа сохраняется, а не теряется.</li>
                <li><span className="x">→</span>Ответили один раз — ассистент знает это с того же момента.</li>
              </ul>
            </div>
            <div>
              <div className="term">
                <div className="tbar"><i style={{background:'#ff5f57'}}></i><i style={{background:'#febc2e'}}></i><i style={{background:'#28c840'}}></i> &nbsp;assistant.log</div>
                <div className="body">
                  <div className="u">&gt; клиент: «Делаете скидку для НКО?»</div>
                  <div className="p">&gt; поиск в документах… 0 совпадений</div>
                  <div className="deny">&gt; <b>ответа нет в документах</b> — не выдумываю,<br/>&nbsp;&nbsp;вопрос сохранён для владельца ✓</div>
                  <div className="gapbox">
                    <div className="gaprow"><span>Скидка для НКО?</span><span className="answer">Ответить →</span></div>
                    <div className="gaprow"><span>Есть тариф для команд?</span><span className="ct">×7</span></div>
                    <div className="gaprow"><span>Поддержка на выходных?</span><span className="ct">×3</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec">
        <div className="wrap">
          <div className="sechead">
            <div><div className="ey">Цены</div><h2>Простые тарифы.</h2></div>
            <p>Начните бесплатно. Перейдёте на Pro, когда клиенты завалят ассистента вопросами.</p>
          </div>
          <div className="prices">
            <div className="plan">
              <div className="pname"><b>Free</b><span className="mono" style={{color:'var(--faint)',fontSize:12}}>для старта</span></div>
              <div className="price">$0<small> / навсегда</small></div>
              <ul>
                <li><span className="mono">01</span>1 ассистент</li>
                <li><span className="mono">02</span>20 страниц документов</li>
                <li><span className="mono">03</span>100 сообщений в месяц</li>
                <li><span className="mono">04</span>Бейдж «Powered by Answerbase»</li>
              </ul>
              <a href="#" className="btn" style={{width:'100%',textAlign:'center'}}>Начать бесплатно</a>
            </div>
            <div className="plan pro">
              <div className="pname"><b>Pro</b><span className="tag">ПОПУЛЯРНЫЙ</span></div>
              <div className="price">$29<small> / в месяц</small></div>
              <ul>
                <li><span className="mono">01</span>3 ассистента</li>
                <li><span className="mono">02</span>500 страниц документов</li>
                <li><span className="mono">03</span>2 000 сообщений в месяц</li>
                <li><span className="mono">04</span>Без брендинга Answerbase</li>
              </ul>
              <a href="#" className="btn btn-acc" style={{width:'100%',textAlign:'center'}}>Начать бесплатно &nbsp;→</a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="glow" style={{width:520,height:300,background:'rgba(61,232,196,.12)',bottom:-40,left:'50%',transform:'translateX(-50%)'}}></div>
        <div className="wrap" style={{position:'relative'}}>
          <div className="ey" style={{justifyContent:'center',marginBottom:22}}>Хватит повторяться</div>
          <h2>Перестаньте отвечать на одни и&nbsp;те&nbsp;же <span className="acc">вопросы.</span></h2>
          <p>Соберите ассистента за несколько минут и передайте ему рутину.</p>
          <a href="#" className="btn btn-acc" style={{fontSize:16,padding:'15px 32px'}}>Начать бесплатно &nbsp;→</a>
        </div>
      </section>
      <footer className="foot">
        <div className="wrap">
          <div className="brand" style={{fontSize:17}}><span className="mk" style={{width:22,height:22,fontSize:12}}>✦</span>Answerbase</div>
          <span className="mono">© 2026 · документы, отвечающие за вас</span>
        </div>
      </footer>
    </div>
  );
}
window.DirTerminal = DirTerminal;
