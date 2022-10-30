import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "./Home";
import Search from "./Search";
import Tv from "./Tv";

const router = createBrowserRouter([
    {
        path:'',
        element:<App/>,
        children:[
            {
                path:`${process.env.PUBLIC_URL}/`,
                element:<Home/>,
            },
            {
                path:'movies/:movieId',
                element:<Home/>,
            },
            {
                path:'/tv',
                element:<Tv/>,
            },
            {
                path:'/tv/:tvId',
                element:<Tv/>,
            },
            {
                path:'/search',
                element:<Search/>,
            },
            {
                path:`/search/:SearchId`,
                element:<Search/>
            },
            {
                path:'/sear',
                element:<Search/>
            },
            {
                path:'/sear/:SearchId',
                element:<Search/>
            }
                        
            

        ]
    }
])

export default router;


