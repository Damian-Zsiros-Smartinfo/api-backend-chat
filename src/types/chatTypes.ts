export interface Message {
  id: string;
  message: string;
  name_sender: string;
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
  image: string;
}
