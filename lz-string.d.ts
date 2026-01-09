// Type declarations for LZ-String library (loaded via CDN)
declare namespace LZString {
  function compressToEncodedURIComponent(input: string): string;
  function decompressFromEncodedURIComponent(input: string): string | null;
}

declare var LZString: {
  compressToEncodedURIComponent: (input: string) => string;
  decompressFromEncodedURIComponent: (input: string) => string | null;
};
