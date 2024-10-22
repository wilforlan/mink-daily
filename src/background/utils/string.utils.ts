export const upperCaseFirstChar = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function readableStringFromObject(data: any) {
  const values = [];

  for (const key in data) {
    let val = data[key];
    if (typeof data[key] === 'object') {
      val = readableStringFromObject(data[key]);
    }

    if (Array.isArray(val)) {
      val = val.join(',');
    }

    values.push(`${key}=${val}`);
  }

  return values.join(' ');
}
