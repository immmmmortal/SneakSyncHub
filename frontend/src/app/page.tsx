'use client'
import {config} from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import PopularShoesCarousel from "@/app/components/shoes_carousel";
import ShoesNewsComponent from "@/app/components/shoes_news";

config.autoAddCss = false


export default function Home() {
    return (
        <>
            <h1 className="text-3xl font-bold">Home page</h1>
            <div className="relative w-full mt-10">
                <div className="absolute w-full pr-10">
                    <h1 className="text-2xl font-bold mb-8">
                        Trending now
                    </h1>
                    <PopularShoesCarousel/>
                    <h1 className="text-2xl font-bold mt-8 mb-8">
                        News
                    </h1>
                    <ShoesNewsComponent/>
                </div>
            </div>
        </>
    )
}
