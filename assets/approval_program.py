from pyteal import *

def approval_program():
    """
    This smart contract implements a stateful counter
    """

    var_counter = Bytes("counter")
    counter = App.globalGet(var_counter)
    new_val = ScratchVar(TealType.uint64) # TODO

    init_counter = Seq([
        App.globalPut(var_counter, Int(0)),
        Return(Int(1))
    ])

    add_three = Seq([
        App.globalPut(var_counter, counter + Int(3)),
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), init_counter],
        [Txn.on_completion() == OnComplete.NoOp, add_three],
        [Int(1), Return(Int(1))]
    )


    return program

if __name__ == "__main__":
    print(compileTeal(approval_program(), Mode.Application))
