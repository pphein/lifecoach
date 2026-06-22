import Dexie, {
    Table
}
    from "dexie";


export interface User {

    id?: number;

    name: string;

    age: number;

    goal: string;

}


class LifeDatabase extends Dexie {


    users!: Table<User>


    constructor() {


        super("life100");


        this.version(1)
            .stores({

                users: "++id"

            });


    }


}


export const db =
    new LifeDatabase();