// https://stackoverflow.com/a/38181008/7578127
export const insertItemAtIndex = (arr: Array<any>, index: number, ...newItems: Array<any>) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted items
  ...newItems,
  // part of the array after the specified index
  ...arr.slice(index)
]
