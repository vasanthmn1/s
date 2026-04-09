import type { CSSProperties, ReactNode } from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PiSpeakerSimpleHighFill, PiSpeakerSimpleSlashFill } from 'react-icons/pi';
import backgroundMusic from './assets/audio/music.mpeg?url';
import page1Image from './assets/image/page-1-image.png';
// import page2LeftImage from './assets/image/page-2-leftside-image.png';
import page2RightImage from './assets/image/page-2rightSide-image-1.png';
import churchImage from './assets/image/page-3-image-2.png';
import hallImage from './assets/image/page-3-image-3.png';
import hallImageHover from './assets/image/page-3-image-3-hover.png';
import churchImageHover from './assets/image/page-3-image-2-hover.png';
import BirdImage from './assets/image/page-3image-3.png';
import BirdImageHover from './assets/image/page-3image-3 hover.png';

import page2Image from './assets/image/page-2-left.svg';

import HeartBlink from './component/HeartBlink';
import WeddingPopup from './component/WeddingPopup';

import useFlipbookSize from './hooks/useFlipbookSizeHook';

type BookMode = 'portrait' | 'landscape';

type FlipBookHandle = {
  pageFlip: () => {
    flipNext: (corner?: 'top' | 'bottom') => void;
    flipPrev: (corner?: 'top' | 'bottom') => void;
  };
};

type FlipEvent = {
  data: number | BookMode;
};

type InitEvent = {
  data: {
    page: number;
    mode: BookMode;
  };
};

type BookPageProps = {
  id: string;
  className: string;
  children: ReactNode;
};

type AudioToggleProps = {
  isMuted: boolean;
  onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const calendarDays = [
  '', '1', '2', '3', '4', '5', '6',
  '7', '8', '9', '10', '11', '12', '13',
  '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27',
  '28', '29', '30', '', '', '', ''
];

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(function BookPage(
  { id, className, children },
  ref
) {
  return (
    <div ref={ref} className="page-frame">
      <article id={id} className={className}>
        {children}
      </article>
    </div>
  );
});

function AudioToggle({ isMuted, onToggle }: AudioToggleProps) {
  return (
    <button
      className="audio-toggle"
      type="button"
      onClick={onToggle}
      aria-pressed={!isMuted}
      aria-label={isMuted ? 'Play background music' : 'Mute background music'}
    >
      {isMuted ? <PiSpeakerSimpleSlashFill /> : <PiSpeakerSimpleHighFill />}
    </button>
  );
}

function App() {
  const bookRef = useRef<FlipBookHandle | null>(null);
  const clickAreaRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookMode, setBookMode] = useState<BookMode>(() => (
    window.innerWidth <= 768 ? 'portrait' : 'landscape'
  ));
  const [fitScale, setFitScale] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const [activeBookWidth, setActiveBookWidth] = useState(940);
  const [isRsvpConfirmed, setIsRsvpConfirmed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const activeWidth = bookMode === 'portrait'
        ? 470
        : currentPage === 0 || currentPage === 3
        ? 940
        : 1880;
      const viewportPadding = window.innerWidth <= 768 ? 24 : 88;
      const availableWidth = Math.max(window.innerWidth - viewportPadding, 320);
      const availableHeight = Math.max(window.innerHeight - 130, 320);
      const scale = Math.min(availableWidth / activeWidth, availableHeight / 1320, 1);

      setActiveBookWidth(activeWidth);
      setFitScale(Number(scale.toFixed(4)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [bookMode, currentPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        bookRef.current?.pageFlip().flipNext();
      }

      if (event.key === 'ArrowLeft') {
        bookRef.current?.pageFlip().flipPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  

  const rsvpButtonLabel = isRsvpConfirmed ? 'Presence Confirmee' : 'Confirmer Ma Presence';
  const rsvpStatusLabel = isRsvpConfirmed
    ? 'Merci, votre presence est bien enregistree.'
    : 'Appuyez sur le bouton pour confirmer votre presence.';

  const bookShellStyle = {
    ['--active-book-width' as string]: `${activeBookWidth}px`,
    ['--fit-scale' as string]: String(fitScale)
  } as CSSProperties;

  const handlePageAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest('button, a, input, textarea, select, label')) {
      return;
    }

    const bounds = clickAreaRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const midpoint = bounds.left + bounds.width / 2;

    if (event.clientX >= midpoint) {
      bookRef.current?.pageFlip().flipNext();
      return;
    }

    bookRef.current?.pageFlip().flipPrev();
  };

  const handleAudioToggle = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isMuted) {
      audio.muted = false;

      try {
        await audio.play();
        setIsMuted(false);
      } catch {
        audio.muted = true;
      }

      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.muted = true;
    setIsMuted(true);
  };
const { width, height, isMobile } = useFlipbookSize();


  return (
    <main className="app-shell">
      <WeddingPopup isOpen={isOpen} onClose={async () => {
        setIsOpen(false);
        setIsMuted(false);
        if (audioRef.current) {
      audioRef.current.muted = false;
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
        // Fallback: stay muted if browser still blocks it
        setIsMuted(true);
      }
    }
      }} />
      <audio ref={audioRef} src={backgroundMusic} loop muted preload="auto" />

      <section className="book-viewport">
        <div
          ref={clickAreaRef}
          className="flip-book-shell"
          style={bookShellStyle}
          onClick={handlePageAreaClick}
        >
          <div className="flip-book-scale">
            <HTMLFlipBook
              ref={bookRef}
              style={{}}
         width={width}

                height={height}
              startPage={0}
              size="fixed"
       
  minWidth={320}
  maxWidth={1600}
  minHeight={420}
  maxHeight={2000}
              startZIndex={0}
              showCover
              autoSize={false}
              usePortrait={isMobile}
              useMouseEvents
              drawShadow={false}
              maxShadowOpacity={0.28}
              flippingTime={900}
              mobileScrollSupport={false}
              clickEventForward
              swipeDistance={36}
              showPageCorners={false}
              disableFlipByClick
              renderOnlyPageLengthChange={false}
              className="flip-book"
              onInit={(event: InitEvent) => {
                const data = event.data as unknown as { page: number; mode: BookMode };
                setCurrentPage(data.page);
                setBookMode(data.mode);
              }}
              onFlip={(event: FlipEvent) => {
                setCurrentPage(event.data as number);
              }}
              onChangeOrientation={(event: FlipEvent) => {
                setBookMode(event.data as BookMode);
              }}
            >
              <BookPage id="page1" className="content page  cover-page">
                <header className="top-strip">
<div></div>
                  <AudioToggle
                    isMuted={isMuted}
                    onToggle={(event) => {
                      event.stopPropagation();
                      void handleAudioToggle();
                    }}
                  />

                </header>
                

                <header className="masthead p1-heading">
                  <h1 className="old-english-font text-center ">The Wedding Time</h1>
                  <div className="masthead-meta">
                    <span>Perfect Match Edition No 3104</span>
                    <span>27/06/2026</span>
                  </div>
                </header>

                <div className="double-rule"></div>

                <section className="hero-block">
                  <h2 className="hero-names">Stephanie &amp; Mohamed</h2>
                  <div className="headline-script">
                    <span></span>
                    <p>Se disent Oui !!!</p>
                    <span></span>
                  </div>
                </section>

                <figure className="hero-photo rounded-photo">
                  <img src={page1Image} alt="Stephanie et Mohamed celebrent leurs fiancailles" />
                </figure>

                <div className="double-rule bottom-gap"></div>

                <section className="save-date-block">
                  <div className="save-date-title">
                    <span>SAVE</span>
                    <strong className='the'>THE</strong>
                    <span>DATE</span>
                  </div>
                  <div className="date-row">
                    <div className="heart-pair"> <HeartBlink/></div>
                    <p>SAMEDI, 27 JUIN 2026</p>
                    <div className="heart-pair"> <HeartBlink/></div>
                  </div>
                </section>
              </BookPage>

              <BookPage id="page2" className="content page editorial-page spread-page spread-left ">
                <header className="top-strip">
                  <div className="thin-rule"></div>
                  <AudioToggle
                    isMuted={isMuted}
                    onToggle={(event) => {
                      event.stopPropagation();
                      void handleAudioToggle();
                    }}
                  />
                </header>

                <header className="inside-header">
                  <div className="meta-row-page-2">
                    <span>Perfect Match Edition No 3104</span>
                    <h2 className="he">L’évenement</h2>
                    <span>27/06/2026</span>
                  </div>
                </header>

                <div className="double-rule-page-2"></div>

                <h3 className="mega-title-1-p2 py-2">LE MATCH PARFAIT</h3>
                <h3 className="mega-title-2-p2 py-2">Stéphanie et Mohamed se marient</h3>

<div className="custom-row p2-row py-1 py-sm-5">
  <div className="custom-col-6">
<div className="row">
 
 <div className="custom-col-12">
    <h3 className='p2-row-heading'>leurs <br /> différences les <br /> ont réunis et <br />l’amour les  unit. </h3>
  </div>
  <div className="custom-col-12 p2-content-box-left py-3">
    <h4 className='py-4'>Le Match d'une Vie</h4>
    <p>
      Après plusieurs saisons jouées en parfaite harmonie, Stéphanie et Mohamed ont décidé de disputer le match de leur vie. Portés par l’amour, le respect et la tolérance, ils vous invitent à partager cet événement unique et à célébrer avec eux une victoire pleine de bonheur.
    </p>
  </div>
  <hr />
    <div className="custom-col-12 p2-content-box-left py-3">
    <h4 className='py-4'>Une Promesse</h4>
    <p>
     Deux cultures, un « OUI » qui n'a pas de frontière.
Ce 27 juin 2026, lorsque Stéphanie et Mohamed se diront oui, ce sera bien plus qu'une promesse entre deux personnes. Ce sera le geste fondateur d'une maison nouvelle, construite sur deux fondations distinctes, et d'autant plus solide pour cela.
    </p>
  </div> 
</div>
  </div>
  <div className="custom-col-6">
<div className="row p2-content-right">
  <div className="col-lg-12">
    <div className='img-container'>
  <img src={page2Image} alt="" />
</div>
  </div>
  <div className="custom-col-12 pt-3">
    <h4 className='head'>
      REMERCIEMENTS : <br />
QUAND LES RACINES <br /> DONNENT DES AILES
    </h4>
  </div>
  <div className="custom-col-12">
    <p className='p2-right-para-1 py-3'>
      On dit souvent que pour bien s’aimer, il faut avoir reçu beaucoup d'amour. Aujourd'hui, les futurs mariés tiennent à dire à leurs parents un "MERCI" pour leur amour et leur précieuse bénédiction.
    </p>
  </div>
    <div className="custom-col-12">
    <p className='p2-right-para-2 py-2'>
     Merci à Mme Antonia SAVERIMUTHU IGNATIUS et à la tendre mémoire de
M. Philip Yogarajah SAVERIMUTHU.
Merci à  Mme Sira HAIDARA BAH et 
M. Cheick Chérif HAIDARA.
    </p>
  </div>
  <div className="custom-col-12  p2-right-para-3 py-3">
<p>
    C’est dans cette joie que les parents vous convient à l’union de leurs enfants : 
  </p>  </div>
  <div className="custom-col-12 text-center p2-right-para-4 ">
    Stéphanie et Mohamed
  </div>
</div>
  </div>

</div>
              
              </BookPage>

              <BookPage id="page3" className="content page invitation-page spread-page spread-right">
             <header className="top-strip">
                  <div className="thin-rule"></div>
                  <AudioToggle
                    isMuted={isMuted}
                    onToggle={(event) => {
                      event.stopPropagation();
                      void handleAudioToggle();
                    }}
                  />
                </header>

                <header className="inside-header">
                  <div className="meta-row-page-2">
                    <span>Perfect Match Edition No 3104</span>
                    <h2 className="old-english-font">L’évenement</h2>
                    <span>27/06/2026, Friday</span>
                  </div>
                </header>

                <div className="double-rule-page-2"></div>

                <h3 className="p3-mega-title">l’ INVITATION <br /> Au Grand jour</h3>

               <div className="event-grip-main">
                 <section className="event-grid">
                  <div className="event-card left-card">
                    <img className="venue-illustration church-illustration normal" src={churchImage} alt="Illustration de l'eglise" />
                    <img className="venue-illustration church-illustration event-img-hover " src={churchImageHover} alt="Illustration de l'eglise" />

                    <h4>Celebration Religieuse</h4>
                    <p className="event-time">15H00</p>
                    <p>PAROISSE</p>
                    <p>ST JOSEPH DES NATIONS</p>
                    <p>122, RUE ST-MAUR</p>
                    <p>75011 PARIS</p>
                  </div>

                  <div className="event-card right-card">
                    <h4>Cocktail De Bienvenue</h4>
                    <p className="event-time">18H00</p>
                    <p>SALLE LE LUXURY</p>
                    <p>27, AVENUE DE MEAUX</p>
                    <p>77240 POINCY</p>
                    <img className="venue-illustration hall-illustration normal" src={hallImage} alt="Illustration de la salle de reception" />
                    <img className="venue-illustration hall-illustration event-img-hover " src={hallImageHover} alt="Illustration de la salle de reception" />
                  </div>
                </section>
               </div>
                <section className="reply-row">
                  <p>Reponse souhaitee avant le 10 mai 2026</p>
                  <button
                    className={`rsvp-chip`}
                    type="button"
                    // onClick={() => setIsRsvpConfirmed((current) => !current)}
                    // aria-pressed={isRsvpConfirmed}
                  >
                  Confirmer Ma Présence
                  </button>
                </section>



                <div className="section-rule"></div>

       <div className="p3-bottom-area">
  <section className="closing-grid">

    {/* LEFT IMAGE */}
    <div className="illustration-feature">
      <figure className="rings-photo">
        <img
          className='bird-img-normal'

          src={BirdImage}
          alt="Illustration de colombes et alliances"
        />
          <img
          className='bird-img-hover'
          src={BirdImageHover}
          alt="Illustration de colombes et alliances"
        />
      </figure>
    </div>

    {/* RIGHT CONTENT */}
    <div className="closing-content">
      <h3 className="closing-title">
        LE PETIT MOT DES MARIÉS:
      </h3>

      <p className="closing-text">
        “Nous nous sommes trouvés, puis choisis. Année après année, l’évidence s’est installée. Aujourd’hui, nous faisons le choix de nous dire oui. Et c’est entourés de ceux qui comptent le plus, que nous souhaitons célébrer ce moment.”z
      </p>
    </div>

  </section>
</div>
              </BookPage>

              {/* <BookPage id="page4" className="content page invitation-page page-four spread-page spread-left back-page">
                <header className="top-strip">
                  <div className="thin-rule"></div>
                  <AudioToggle
                    isMuted={isMuted}
                    onToggle={(event) => {
                      event.stopPropagation();
                      void handleAudioToggle();
                    }}
                  />
                </header>

                <header className="inside-header">
                  <div className="meta-row">
                    <span>Perfect Match Edition No 3104</span>
                    <h2 className="old-english-font">L&apos;evenement</h2>
                    <span>27/06/2026, Friday</span>
                  </div>
                </header>

                <div className="double-rule"></div>

                <h3 className="mega-title">L&apos;INVITATION AU GRAND JOUR</h3>

                <section className="event-grid event-grid-compact">
                  <div className="event-card left-card">
                    <img className="venue-illustration church-illustration" src={churchImage} alt="Illustration de l'eglise" />
                    <h4>Celebration Religieuse</h4>
                    <p className="event-time">15H00</p>
                    <p>PAROISSE</p>
                    <p>ST JOSEPH DES NATIONS</p>
                    <p>122, RUE ST-MAUR</p>
                    <p>75011 PARIS</p>
                  </div>

                  <div className="event-card right-card">
                    <h4>Cocktail De Bienvenue</h4>
                    <p className="event-time">18H00</p>
                    <p>SALLE LE LUXURY</p>
                    <p>27, AVENUE DE MEAUX</p>
                    <p>77240 POINCY</p>
                    <img className="venue-illustration hall-illustration" src={hallImage} alt="Illustration de la salle de reception" />
                  </div>
                </section>

                <section className="reply-row">
                  <p>Reponse souhaitee avant le 10 mai 2026</p>
                  <button
                    className={`rsvp-chip${isRsvpConfirmed ? ' is-confirmed' : ''}`}
                    type="button"
                    onClick={() => setIsRsvpConfirmed((current) => !current)}
                    aria-pressed={isRsvpConfirmed}
                  >
                    {rsvpButtonLabel}
                  </button>
                </section>

                <p className="rsvp-status" aria-live="polite">{rsvpStatusLabel}</p>

                <div className="section-rule"></div>

                <section className="closing-grid split-feature-grid">
                  <div className="illustration-feature">
                    <figure className="rings-photo large-illustration">
                      <img src={ringsImage} alt="Illustration de colombes et alliances" />
                    </figure>
                    <h3 className="closing-title">L&apos;ENVOL : UN SYMBOLE DE FIDELITE ETERNELLE</h3>
                    <p>Comme ces deux colombes portant leurs alliances vers le meme horizon, Stephanie et Mohamed unissent leurs destins. Sous l&apos;aile protectrice de leurs familles et amis, ils s&apos;appretent a prendre leur envol pour ecrire ensemble leurs plus belles pages.</p>
                  </div>

                  <div className="closing-right note-feature">
                    <section className="story-section no-gap">
                      <h5>LE PETIT MOT DES MARIES :</h5>
                      <p>Nous nous sommes trouves, puis choisis. Annee apres annee, l&apos;evidence s&apos;est installee. Aujourd&apos;hui, nous faisons le choix de nous dire oui. Et c&apos;est entoures de ceux qui comptent le plus, que nous souhaitons celebrer ce moment.</p>
                    </section>

                    <figure className="article-photo feature-photo bottom-photo">
                      <img src={page2RightImage} alt="Stephanie et Mohamed partagent un moment tendre" />
                    </figure>
                  </div>
                </section>
              </BookPage> */}
            </HTMLFlipBook>
          </div>

        </div>
      </section>

    </main>
  );
}

export default App;
