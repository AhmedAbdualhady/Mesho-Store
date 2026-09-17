import {
FaStar,
FaStarHalfAlt,
FaRegStar
} from "react-icons/fa";

function StarRating({ rating }) {

const stars = [];

for (let i = 1; i <= 5; i++) {

if (rating >= i) {

stars.push(
<FaStar key={i} />
      );

    } else if (rating >= i - 0.5) {

stars.push(
<FaStarHalfAlt key={i} />
      );

    } else {

stars.push(
<FaRegStar key={i} />
      );

    }

  }

return (
<div className="rating">

      {stars}

<span>
        {Number(rating).toFixed(1)}
</span>

</div>
  );

}

export default StarRating;
