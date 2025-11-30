import { useEffect, useState } from "preact/hooks";

import {
  AiFillAccountBook,
  AiFillCloseCircle,
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineDownload,
  AiOutlineFileImage,
  AiOutlineScissor,
} from "react-icons/ai";
import "croppie/croppie.css";
import "./style.scss";

import Croppie from "croppie";

let CropArea = document.createElement("div");
var c;
let bg = new Image();

// frame size
let DocW = 2500
let DocH = 3179

// start point
let Cropy = 1125 
let Cropx = 1000 

// // cut size
// let CropH = 1650
// let CropW = 1900
let CropH = 675    
let CropW = 570  

export function App(props) {
  let file = document.createElement("input");
  const [cropVis, setcropVis] = useState(false);
  const [BgLoadStatus, setBgLoadStatus] = useState(null);
  const [CroppedImg, setCroppedImg] = useState(null);
  const [CroppedImgStatus, setCroppedImgStatus] = useState(null);
  const [FontLoaded, setFontLoaded] = useState(false);
  const [GeneratedData, setGeneratedData] = useState(null);
  const [PreviewAct, setPreviewAct] = useState(null);
  const [Name, setName] = useState("");
  const [Class, setClass] = useState("");

  bg.src = "./frame.png";
  bg.onload = () => {
    setBgLoadStatus(1);
  };

  let CroppedImgTag = new Image();
  CroppedImgTag.src = CroppedImg;
  CroppedImgTag.onload = () => {
    setCroppedImgStatus(1);
  };

  let _canv = document.createElement("canvas");
  let _ctx = _canv.getContext("2d");
  _canv.width = DocW;
  _canv.height = DocH;

  useEffect(() => {
    draw();
  }, [CroppedImgStatus, FontLoaded, Name, Class]);

  // Ensure the Nexa font is loaded before drawing to the canvas
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts && document.fonts.load) {
      document.fonts.load("1em 'Nexa Bold'").then(() => {
        setFontLoaded(true);
      }).catch(() => setFontLoaded(true));
    } else {
      setFontLoaded(true);
    }
  }, []);

  function draw() {
    if (BgLoadStatus && CroppedImgStatus && FontLoaded) {
      // Clear canvas before redrawing
      _ctx.clearRect(0, 0, _canv.width, _canv.height);
      _ctx.drawImage(CroppedImgTag, Cropx, Cropy, CropW, CropH);
      _ctx.drawImage(bg, 0, 0, _canv.width, _canv.height);

      // font  sans-serif for class only with out bold
      

      _ctx.fillStyle = "black";
      // upper case each word input 
      let _name = (Name || "").split(" ")
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(" ");

      let _class = `${Class || ""}`;

      // Calculate text widths and automatically reduce font size if needed
      // Helper to pick a font size that fits a specific width
      const fitFontSize = (text, weight, family, startSize, maxWidth, minSize = 24) => {
        let size = startSize;
        // Use a smaller decrement step so fitting is less aggressive
        const step = 1;
        _ctx.font = `${weight} ${size}px ${family}`;
        let w = _ctx.measureText(text).width;
        while (w > maxWidth && size > minSize) {
          size -= step; // decrement by 1px and re-measure for smoother fit
          _ctx.font = `${weight} ${size}px ${family}`;
          w = _ctx.measureText(text).width;
        }
        return { size, width: w };
      };
      // _ctx.shadowBlur = 5;
      // _ctx.shadowColor = "black";

      // place name and class in center
      _ctx.textAlign = "center";
      const centerX = Cropx + CropW / 2;
// font size and type montrast semi bold


      /* Use Nexa Bold for canvas text so it matches UI font */
      const nameMaxWidth = CropW +100 ; // allow a bit less padding so text can be larger
      const classMaxWidth = CropW +50 ;
      // Increase start sizes and min sizes so text stays readable
      const nameFit = fitFontSize(_name || "", 700, "'Nexa Bold', Montserrat, sans-serif", 110, nameMaxWidth, 90);
      _ctx.font = `700 ${nameFit.size}px 'Nexa Bold', Montserrat, sans-serif`;
      // under the image centered
      _ctx.fillText(_name, centerX, Cropy + CropH + 140);

      const classFit = fitFontSize(_class || "", 700, "'Nexa Bold', Montserrat, sans-serif", 100, classMaxWidth, 80);
      _ctx.font = `700 ${classFit.size}px 'Nexa Bold', Montserrat, sans-serif`;
      _ctx.fillText(_class, centerX, Cropy + CropH + 240);

      setGeneratedData(_canv.toDataURL({ pixelRatio: 3 }));

      //console.log(_data);
      // window.open(_data);
    } else {
      console.log(BgLoadStatus, CroppedImgStatus);
    }
  } 

  file.type = "file";
  let Img;
  file.onchange = () => {
    let _file = file.files[0];
    let fileReader = new FileReader();

    fileReader.readAsDataURL(_file);
    fileReader.onload = () => {
      Img = fileReader.result;
      Crop();
    };
  };

  function Crop() {
    // console.log(Img);
    // crop.current.append(Img);
    setcropVis(true);
    c = new Croppie(CropArea, {
      url: Img,

      enableOrientation: true,

      viewport: {
        height: CropH/2 ,
        width: CropW /2,
        type: "rectangle",
      },
    });
  }

  function Preview() {
    return (
      <>
        {PreviewAct && (
          <div
            onClick={() => {
              setPreviewAct(false);
            }}
            className="preview"
          >
            <img src={GeneratedData} alt="" srcset="" />
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${GeneratedData ? GeneratedData : bg.src})`,
        }}
        className="Header"
      ></div>
      <div className="Cont">
        <h1></h1>

        <div className="Actions">
          {GeneratedData ? (
            <div>
              <a href={GeneratedData} download="Sweet">
                <button>
                  <AiOutlineDownload size="30" />
                  <span>Download Profile</span>
                </button>
              </a>
            </div>
          ) : (
            <div className="flex-column">
            {/* name */}
               <input
                type="text"
                placeholder="Type Your Name"
                onInput={({ target }) => setName(target.value)}
              />
              <input
                type="text"
                placeholder="Position (optional)"
                onInput={({ target }) => setClass(target.value)}
              /> 
              <button
                onClick={() => {
                  file.click();
                }}
              >
                <AiOutlineCamera size="30" />

                <span>Upload photo</span>
              </button>
            </div>
          )}
        </div>

        {/* {GeneratedData && (
          <div className="GetAct">
            <a href={GeneratedData} download="campaign poster">
              <button>
                <AiOutlineDownload size="40" />
              </button>
            </a>
         
         
          </div>)
        } */}
      </div>

      <div
        ref={(e) => {
          if (e) {
            e.innerHTML = "";
            // e.append(_canv);
          }
        }}
      ></div>

      <Preview></Preview>
      <Cropper
        setCroppedImg={setCroppedImg}
        visible={cropVis}
        set={setcropVis}
      />
    </>
  );
}

function Cropper({ visible, set, setCroppedImg }) {
  return (
    <div className={visible ? "vi" : "hi"}>
      <div
        ref={(e) => {
          if (e) {
            e.innerHTML = "";
            e.append(CropArea);
          }
        }}
        className="Crop"
      ></div>
      <div className="Tools">
        <button
          onClick={() => {
            c.destroy();
            set(false);
          }}
        >
          <AiOutlineClose size="30" />
        </button>
        <button
          onClick={() => {
            //CroppedImg =

            c.result({ size: { height: CropH, width: CropW } }).then((e) => {
              setCroppedImg(e);
              c.destroy();
              set(false);
            });
          }}
        >
          <AiOutlineScissor size="30" />
        </button>
      </div>
    </div>
  );
}
