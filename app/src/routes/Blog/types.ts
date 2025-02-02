export type BlogPost = {
  id: string;
  title: string;
  date: string; // ISO string format
  showTOC?: boolean;
  showInList?: boolean;
  component: (props: {
    onSectionsChange: (sections: Section[]) => void;
  }) => JSX.Element;
};

export interface Section {
  id: string;
  title: string;
  level: number;
}
