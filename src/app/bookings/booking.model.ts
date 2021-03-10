export class Booking{
  constructor(
    public id: string,
    public bandId:string,
    public userId: string,
    public bandTitle:string,
    public bandImage:string,
    public firstName: string,
    public lastName: string,
    public personRequired: number,
    public bookedfrom: Date,
    public bookedTo: Date

  ){}
}
