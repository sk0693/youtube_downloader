import React from "react";

const Select = ({ selectChange, quality, disabled, formats, link }) => {
  let object = {};
  const getFormats = (formats) => {
    // const arrayFormats = formats.map((ele) => {
    //   if (ele && parseInt(ele)) {
    //     return parseInt(ele);
    //   }
    // });

    // const arrayFormats = formats.map((ele) => {
    //   if (ele && parseInt(ele.quality)) {
    //     return ele;
    //   }
    // });

    return formats
      // .sort((a, b) => a.quality - b.quality)
      .map((ele, index) => {
        return (
          <option key={index} value={index}>
            {ele.qualityLabel || ''}
          </option>
        );
      });
  };

  return (
    <>
      <div className="formatQuality">
        <label className="formatLabel">Video Quality</label>
        <select
          disabled={disabled}
          onChange={selectChange}
          value={quality}
          className="input-field"
        >
          <option key="" value="">
            Auto
          </option>
          {formats && formats.length > 0 && formats[0] != "loading" ? (
            getFormats(formats)
          ) : (
              <option key="loading" value="loading" disabled={true}>
                {`${
                  link ? "Loading....." : ""
                  }`}</option>
            )}
        </select>
      </div>
    </>
  );
};

export default Select;
