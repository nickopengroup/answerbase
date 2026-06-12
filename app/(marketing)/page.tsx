import Link from "next/link";

export const metadata = {
  title: "Answerbase — Your documents, answering your customers",
  description:
    "Turn the FAQs, guides and policies you already have into a chat assistant on your site. Precise, cited answers — and an honest 'I don't know' when it's not there.",
};

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="wrap">
          <Link className="brand" href="/">
            <span className="mk">A</span>
            <b>Answerbase</b>
          </Link>
          <div className="navlinks">
            <span className="nl" style={{ display: "contents" }}>
              <a href="#how">How it works</a>
              <a href="#honest">Honesty</a>
              <a href="#pricing">Pricing</a>
              <Link href="/login">Sign in</Link>
            </span>
            <Link href="/signup" className="btn btn-acc">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="top">
            <div className="ey c">An assistant built from your own documents</div>
            <h1>
              Your documents,
              <br />
              answering <em>your customers.</em>
            </h1>
            <p className="lede">
              Answerbase turns the FAQs, guides and policies you already have
              into a chat assistant on your site — so customers get precise
              answers in seconds, and your team stops repeating itself.
            </p>
            <div className="heroctas">
              <Link href="/signup" className="btn btn-acc">
                Start free
              </Link>
              <a href="#pricing" className="btn">
                See pricing
              </a>
            </div>
            <div className="trust">
              No credit card · Live in minutes · Cancel anytime
            </div>
          </div>
          <div className="heroimg">
            <div className="chat">
              <div className="top">
                <span className="l">
                  <span className="av">A</span> Meridian Advisory · assistant
                </span>
                <span className="st">Online</span>
              </div>
              <div className="chatbody">
                <div className="q">
                  <span>How much is the Pro plan, and what&apos;s included?</span>
                </div>
                <div>
                  <div className="a-label">Answered from your documents</div>
                  <div className="a-txt">
                    The <b>Pro plan is $29/month</b>: 3 assistants, 500 pages of
                    documents and 2,000 messages a month.
                  </div>
                  <div className="cite">
                    <span className="chip">↳ pricing.pdf · p. 2</span>
                    <span className="lab">source cited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STEPS */}
      <section className="steps" id="how">
        <div className="wrap">
          <div className="stephead">
            <div className="ey c" style={{ justifyContent: "center" }}>
              Getting started
            </div>
            <h2>
              A live assistant in <em>three steps.</em>
            </h2>
            <p>
              No setup calls, no training datasets, no ML jargon. Bring the
              documents you already have — that&apos;s all it takes.
            </p>
          </div>
          <div className="srow">
            <div className="step">
              <div className="num">i.</div>
              <h3>Upload your documents</h3>
              <p>
                FAQs, price lists, policies — whatever you already have. PDF,
                Markdown or plain text. Answerbase parses and indexes each file,
                with a status for every one.
              </p>
              <div className="ui">
                <div className="bar">
                  <span className="d"></span> Documents
                </div>
                <div className="frow">
                  <div className="ic"></div>
                  <div className="nm">
                    <b>Price list 2026.pdf</b>
                    <small>PDF · 4 pages</small>
                  </div>
                  <span className="stat ok">Ready</span>
                </div>
                <div className="frow">
                  <div className="ic"></div>
                  <div className="nm">
                    <b>Service terms.md</b>
                    <small>MD · 11 KB</small>
                  </div>
                  <span className="stat ok">Ready</span>
                </div>
                <div className="frow">
                  <div className="ic"></div>
                  <div className="nm">
                    <b>Onboarding guide.txt</b>
                    <small>TXT · 6 KB</small>
                  </div>
                  <span className="stat idx">Indexing…</span>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="num">ii.</div>
              <h3>Test it in the dashboard</h3>
              <p>
                Ask the way your customers ask. Every answer comes only from your
                documents and cites its source — so you see exactly what a
                customer will get.
              </p>
              <div className="ui">
                <div className="bar">
                  <span className="d"></span> Playground
                </div>
                <div className="askbar">
                  <span className="inp">Can I get a refund for this month?</span>
                  <span className="send">→</span>
                </div>
                <div className="ans">
                  Yes. Refunds for the unused period are issued within 14 days on
                  a written request.
                  <br />
                  <span className="src">↳ Service terms · §4.2</span>
                </div>
              </div>
            </div>
            <div className="step">
              <div className="num">iii.</div>
              <h3>Drop it on your site</h3>
              <p>
                Copy one line of code and the widget appears on your site in your
                brand colour. Customers ask in the corner — you do nothing.
              </p>
              <div className="ui">
                <div className="bar">
                  <span className="d"></span> Embed snippet
                </div>
                <div className="embed">
                  <span className="tag">{"<script"}</span> src=&quot;answerbase.app/embed.js&quot;
                  data-bot=&quot;meridian&quot;
                  <span className="tag">{"></script>"}</span>
                </div>
                <div className="widgetwrap">
                  <div className="mini">
                    Hi! How can I help with Meridian&apos;s documents?
                  </div>
                  <div className="bub">A</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST */}
      <section className="honest" id="honest">
        <div className="wrap">
          <div>
            <div className="ey">Never makes things up</div>
            <h2>
              When it doesn&apos;t know,
              <br />
              <em>it says so.</em>
            </h2>
            <ul className="checks">
              <li>
                <span className="x">—</span>No invented prices, dates or terms —
                the answer is either in your documents or it isn&apos;t.
              </li>
              <li>
                <span className="x">—</span>Every unanswered question is saved,
                not lost in a thread.
              </li>
              <li>
                <span className="x">—</span>You answer once, and the assistant
                knows it from that moment on.
              </li>
            </ul>
          </div>
          <div className="refusal">
            <div className="q">
              <span>Do you offer a discount for nonprofits?</span>
            </div>
            <div className="deny">
              That&apos;s <b>not in your documents</b>, so I won&apos;t guess —
              I&apos;ve saved the question for the owner.
            </div>
            <div className="glabel">Gaps in your knowledge base</div>
            <div className="gaprow">
              <span>Discount for nonprofits?</span>
              <span className="answer">Answer →</span>
            </div>
            <div className="gaprow">
              <span>Is there a team plan?</span>
              <span className="ct">asked ×7</span>
            </div>
            <div className="gaprow">
              <span>Weekend support?</span>
              <span className="ct">asked ×3</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="stephead" style={{ marginBottom: 0 }}>
            <div className="ey c" style={{ justifyContent: "center" }}>
              Pricing
            </div>
            <h2>
              Simple <em>plans.</em>
            </h2>
            <p>
              Start free. Move to Pro when customers start keeping your assistant
              busy.
            </p>
          </div>
          <div className="prices">
            <div className="plan">
              <div className="pname">
                <b>Free</b>
                <span className="muted">to get started</span>
              </div>
              <div className="price">
                $0<small> / forever</small>
              </div>
              <ul>
                <li>
                  <span className="ck">✦</span>1 assistant
                </li>
                <li>
                  <span className="ck">✦</span>20 pages of documents
                </li>
                <li>
                  <span className="ck">✦</span>100 messages per month
                </li>
                <li>
                  <span className="ck">✦</span>&ldquo;Powered by Answerbase&rdquo;
                  badge
                </li>
              </ul>
              <Link href="/signup" className="btn">
                Start free
              </Link>
            </div>
            <div className="plan pro">
              <div className="pname">
                <b>Pro</b>
                <span className="tag">Most popular</span>
              </div>
              <div className="price">
                $29<small> / month</small>
              </div>
              <ul>
                <li>
                  <span className="ck">✦</span>3 assistants
                </li>
                <li>
                  <span className="ck">✦</span>500 pages of documents
                </li>
                <li>
                  <span className="ck">✦</span>2,000 messages per month
                </li>
                <li>
                  <span className="ck">✦</span>No Answerbase branding
                </li>
              </ul>
              <Link href="/signup" className="btn btn-paper">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="wrap">
          <div
            className="ey c"
            style={{ justifyContent: "center", marginBottom: 22 }}
          >
            Stop repeating yourself
          </div>
          <h2>
            Stop answering the same <em>questions.</em>
          </h2>
          <p>Build your assistant in minutes and hand it the routine.</p>
          <Link
            href="/signup"
            className="btn btn-acc"
            style={{ fontSize: 16, padding: "15px 32px" }}
          >
            Start free
          </Link>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <Link className="brand" href="/">
            <span className="mk" style={{ width: 26, height: 26, fontSize: 15 }}>
              A
            </span>
            <b style={{ fontSize: 20 }}>Answerbase</b>
          </Link>
          <div className="fl">
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login">Sign in</Link>
          </div>
          <span className="c">© 2026 · Documents that answer your customers</span>
        </div>
      </footer>
    </>
  );
}
