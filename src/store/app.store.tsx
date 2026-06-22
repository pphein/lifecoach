import {

    create

}

    from "zustand";


interface AppState {


    lifeScore: number;


    increaseScore:
    (value: number) => void;


}


export const useAppStore =
    create<AppState>((set) => (


        {


            lifeScore: 85,


            increaseScore(value) {


                set(state => ({


                    lifeScore:
                        state.lifeScore + value


                }))


            }


        }

    ));