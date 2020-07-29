import gql from 'graphql-tag'  //引入graphql
let apollo = null
export default  apollo = {
  newScore: gql `mutation newScore($grade:String!,$scope:String!,$belong_to:String!){  
        newScore(grade:$grade,scope:$scope,belong_to:$belong_to){
            grade
            belong_to
    }
  }`,
  getAaccountMoves: gql `query accountMoves($limit:Int,$skip:Int){  
    countAccountMove
    accountMoves(limit:$limit,skip:$skip){
      _id
      name
      contract_id{
        _id
        name
        active
      }
      department_id{
        _id
        name
        active
      }
      journal_id{
        _id
        name
      }
      period_id{
        _id
        name
        code
      }
      partner_id{
        _id
        name
      }
      amount
      line_ids{
        _id
        account_id{
          _id
          name
        }
        expense_type_id{
          _id
        }
        # contract_id{
        #   _id
        #   name
        #   active
        # }
        department_id{
          _id
        }
        analytic_account_id{
          _id
          name
          active
        }
        journal_id{
          _id
          name
        }
        period_id{
          _id
          name
          code
        }
        partner_id{
          _id
          is_supplier
          is_customer
          name
          active
        }
        credit
        debit
        name
        date_maturity
      }
      state
      
    }
}`,

}