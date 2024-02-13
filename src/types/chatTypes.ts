export interface Message {
  id: string;
  message: string;
  name_sender: string;
  created_at?: string;
  images?:
    | Image[]
    | {
        file: {
          name: string;
        };
        arrayBuffer: Buffer;
      }[];
}

export interface Image {
  id: string;
  link_image?: string;
  id_message: string;
  image: string; // base64
}
