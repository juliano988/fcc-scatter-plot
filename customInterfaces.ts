 interface Athletes{
    Doping: string,
    Name: string,
    Nationality: string,
    Place: number,
    Seconds: number,
    Time: string,
    URL: string,
    Year: number
  }
  
export interface GraphicProps{
    data: Array<Athletes>,
    width: string,
    height: string,
  }