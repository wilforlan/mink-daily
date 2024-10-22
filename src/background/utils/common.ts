export function base64ToBlob(base64: string) {
    const [typeString, base64Data] = base64.split(',');
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i += 1) {
        int8Array[i] = byteString.charCodeAt(i);
    }
    const [type] = typeString.split(':')[1].split(';');
    return new Blob([int8Array], { type });
}

export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
            reader.abort();
            reject(new DOMException('Problem parsing input file.'));
        };
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });
}

export function bytesToMb(bytes: number): number {
    return bytes / 1024 / 1024;
}
