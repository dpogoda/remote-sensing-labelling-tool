export function certaintyToColor(certainty: number) {
  const certaintyValue = certainty * 255;
  return `rgba(${255 - certaintyValue}, ${certaintyValue}, 0, 0.7)`;
}

export function formatTitle(title: string) {
  if (!title.length) return '';
  let a = title.split('_')[0]
  a = a.charAt(0).toUpperCase() + a.slice(1)
  let b = title.split('_')[1]
  b = b.charAt(0).toUpperCase() + b.slice(1)
  return a + ' ' + b
}

/**
* Get 2020-09-01 from the fullTitle
* @param fullTitle something like ac_2020_09_1.6901015728223143_52.34517566960607_11
*/
export function getDateFromFullTitle(fullTitle: string) {
  if (!fullTitle.length) return '';
  let splits = fullTitle.split('_');
  let date = splits[1] + '-' + String(splits[2]).padStart(2, '0'); // + '-' + String(splits[3].split(".")[0]).padStart(2, '0')
  return date
}