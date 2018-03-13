export function mmToPx (value) {
  return parseInt((96 * value) / 25.4)
}

export function createPrintParameters (map, layout, layers, extent, opts = {}) {
  const params = {
    'SERVICE': 'WMS',
    'REQUEST': 'GetPrint',
    'TEMPLATE': layout.name,
    'DPI': opts.dpi,
    'FORMAT': opts.format,
    'SRS': map.getView().getProjection().getCode(),
    'LAYERS': layers.join(','),
    'map0:EXTENT': extent.join(','),
    'map0:SCALE': map.getView().getScale(),
    'map0:ROTATION': map.getView().getRotation() * 180 / Math.PI,

    'gislab_project': opts.title,
    'gislab_author': opts.author,
    'gislab_contact': opts.contact
  }
  if (layout.map.grid) {
    params['map0:GRID_INTERVAL_X'] = layout.map.grid.intervalX
    params['map0:GRID_INTERVAL_Y'] = layout.map.grid.intervalY
  }

  layout.labels.forEach(label => {
    if (label.value) {
      params[label.title] = label.value
    }
  })
  return params
}

export function formatCopyrights (copyrights) {
  const formatted = copyrights
    .map(attribution => attribution.getHTML().replace('<a ', '<span ').replace('</a>', '</span>'))
    .join('<span>&nbsp;|&nbsp;</span>')

  const cssStyles = [
    'background-color:rgba(255,255,255,0.75)',
    'position:absolute',
    'bottom:0',
    'right:0',
    'padding-left:8px',
    'padding-right:8px',
    'font-family:Liberation Sans'
  ]
  return `<div style="${cssStyles.join(';')}">${formatted}</div>`
}

export function openPrintWindow (layout, url) {
  // if (url.indexOf('://') === -1) {
  //   url = `${location.protocol}//${location.host}${url}`
  // }
  let popup
  function closePrint () {
    if (popup) {
      popup.close()
    }
  }
  // popup = window.open(url)
  popup = window.open()
  const pageOrientation = (layout.width > layout.height) ? 'landscape' : 'portrait'
  popup.document.head.innerHTML =
    `<style type="text/css" media="print">
      @page {
        size: ${pageOrientation};
        margin: 0;
      }
      html, body {
        margin: 0;
        height: 100%;
      }
      img {
        height: calc(100% - 1px);
      }
    </style>`

  popup.document.body.innerHTML = `<img onload="window.print()" src="${url}"></img>`
  popup.onbeforeunload = closePrint
  popup.onafterprint = closePrint
}
